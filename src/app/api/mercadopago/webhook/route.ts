import { NextRequest, NextResponse }        from 'next/server'
import { MercadoPagoConfig, Payment }        from 'mercadopago'
import { collection, query, where, getDocs,
         doc, updateDoc }                    from 'firebase/firestore'
import { db }                                from '@/lib/firebase'

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    console.log('Webhook MP recibido:', JSON.stringify(body, null, 2))

    // MP envía distintos tipos de notificaciones, solo nos interesan los pagos
    if (body.type !== 'payment') {
      return NextResponse.json({ received: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) {
      return NextResponse.json({ received: true })
    }

    // Consultamos el pago directamente a MP para verificar (nunca confiar solo en el webhook)
    const payment    = new Payment(client)
    const paymentData = await payment.get({ id: paymentId })

    console.log('Pago verificado:', {
      id:         paymentData.id,
      status:     paymentData.status,
      externalRef: paymentData.external_reference,
    })

    const orderId     = paymentData.external_reference
    const mpStatus    = paymentData.status ?? 'pending'
    const orderStatus = STATUS_MAP[mpStatus] ?? 'pendiente'

    if (!orderId) {
      console.error('No se encontró external_reference en el pago')
      return NextResponse.json({ received: true })
    }

    // Buscar la orden en Firestore por ID
    const orderRef = doc(db, 'orders', orderId)

    await updateDoc(orderRef, {
      status:          orderStatus,
      paymentId:       String(paymentData.id),
      paymentStatus:   mpStatus,
      paymentMethod:   paymentData.payment_method_id ?? null,
      paidAt:          mpStatus === 'approved' ? new Date() : null,
      updatedAt:       new Date(),
    })

    console.log(`Orden ${orderId} actualizada → ${orderStatus}`)

    // MP espera un 200 para saber que recibimos la notificación
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