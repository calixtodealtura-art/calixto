import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { z } from 'zod'
import { getAdminDb } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'

const bodySchema = z.object({
  type: z.string().optional(),
  data: z.object({
    id: z.union([z.string(), z.number()]),
  }).optional(),
}).passthrough()

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

// Mapa de estados de MP → estados de tu app
const STATUS_MAP: Record<string, string> = {
  approved:    'pagado',
  pending:     'pendiente',
  in_process:  'pendiente',
  rejected:    'rechazado',
  cancelled:   'cancelado',
  refunded:    'reembolsado',
}

// Valida la firma que MP manda en x-signature/x-request-id.
// Devuelve true si es válida, false si no, null si no hay secreto configurado
// (no se puede validar → se sigue procesando con un warning, ver crear-preferencia).
function verifySignature(req: NextRequest, dataId: string): boolean | null {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  if (!secret) return null

  const signatureHeader = req.headers.get('x-signature')
  const requestId        = req.headers.get('x-request-id')
  if (!signatureHeader || !requestId) return false

  const parts: Record<string, string> = {}
  for (const chunk of signatureHeader.split(',')) {
    const [key, value] = chunk.split('=').map(s => s.trim())
    if (key && value) parts[key] = value
  }

  const ts = parts.ts
  const v1 = parts.v1
  if (!ts || !v1) return false

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`
  const expected = createHmac('sha256', secret).update(manifest).digest('hex')

  const expectedBuf = Buffer.from(expected, 'hex')
  const receivedBuf = Buffer.from(v1, 'hex')
  if (expectedBuf.length !== receivedBuf.length) return false

  return timingSafeEqual(expectedBuf, receivedBuf)
}

export async function POST(req: NextRequest) {
  try {
    const parsed = bodySchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ received: true })
    }
    const body = parsed.data

    if (body.type !== 'payment') {
      return NextResponse.json({ received: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) {
      return NextResponse.json({ received: true })
    }

    const signatureResult = verifySignature(req, String(paymentId))
    if (signatureResult === false) {
      console.error('Webhook MP rechazado: firma inválida')
      return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
    }
    if (signatureResult === null) {
      console.warn(
        'Webhook MP sin validar firma: falta MERCADOPAGO_WEBHOOK_SECRET. ' +
        'Configurala en Mercado Pago → Tu integración → Webhooks para cerrar este hueco.'
      )
    }

    // Consultamos el pago directamente a MP para verificar (nunca confiar solo en el webhook)
    const payment     = new Payment(client)
    const paymentData = await payment.get({ id: paymentId })

    const orderId     = paymentData.external_reference
    const mpStatus     = paymentData.status ?? 'pending'
    const orderStatus  = STATUS_MAP[mpStatus] ?? 'pendiente'

    if (!orderId) {
      console.error('No se encontró external_reference en el pago')
      return NextResponse.json({ received: true })
    }

    const adminDb = getAdminDb()

    await adminDb.collection('orders').doc(orderId).update({
      status:        orderStatus,
      paymentId:     String(paymentData.id),
      paymentStatus: mpStatus,
      paymentMethod: paymentData.payment_method_id ?? null,
      paidAt:        mpStatus === 'approved' ? FieldValue.serverTimestamp() : null,
      updatedAt:     FieldValue.serverTimestamp(),
    })

    return NextResponse.json({ received: true })

  } catch (err) {
    console.error('Error en webhook MP:', err)
    // Devolvemos 200 igual para que MP no reintente indefinidamente
    return NextResponse.json({ received: true })
  }
}

// MP también hace un GET para verificar que el endpoint existe
export async function GET() {
  return NextResponse.json({ status: 'Webhook activo' })
}
