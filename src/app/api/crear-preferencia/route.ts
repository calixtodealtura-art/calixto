import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { z } from 'zod'
import { getAdminAuth, getAdminDb } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

// Fallbacks solo por si no existe el documento de configuración en Firestore
const FALLBACK_FREE_SHIPPING_THRESHOLD = 120_000
const FALLBACK_SHIPPING_COST            = 1_500

const bodySchema = z.object({
  items: z.array(z.object({
    product: z.object({ id: z.string().min(1) }).passthrough(),
    quantity: z.number().int().positive(),
  })).min(1),
  deliveryMethod: z.enum(['retiro', 'envio_caba_gba', 'envio_interior']),
  shippingAddress: z.object({
    fullName: z.string().min(1).max(120),
    address:  z.string().min(1).max(200),
    city:     z.string().min(1).max(120),
    province: z.string().min(1).max(120),
    zipCode:  z.string().min(1).max(20),
    phone:    z.string().min(1).max(40),
  }).optional(),
  pickupContact: z.object({
    fullName: z.string().min(1).max(120),
    phone:    z.string().min(1).max(40),
  }).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const parsed = bodySchema.safeParse(await req.json())

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de pedido inválidos' },
        { status: 400 }
      )
    }

    const { items, deliveryMethod, shippingAddress, pickupContact } = parsed.data

    if (deliveryMethod === 'retiro' && !pickupContact) {
      return NextResponse.json(
        { error: 'Faltan datos de contacto para el retiro' },
        { status: 400 }
      )
    }

    if (deliveryMethod !== 'retiro' && !shippingAddress) {
      return NextResponse.json(
        { error: 'Faltan datos de envío' },
        { status: 400 }
      )
    }

    // ── Identidad: si viene un token, usamos el uid verificado, nunca el que manda el body ──
    let userId = 'guest'
    const authHeader = req.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const decoded = await getAdminAuth().verifyIdToken(authHeader.slice(7))
        userId = decoded.uid
      } catch {
        // Token inválido/expirado: seguimos como invitado en vez de confiar en lo que mande el cliente
      }
    }

    const adminDb = getAdminDb()

    // ── Revalidar cada ítem contra Firestore: el precio y el nombre nunca se toman del cliente ──
    const productSnaps = await Promise.all(
      items.map(i => adminDb.collection('products').doc(i.product.id).get())
    )

    const missing = productSnaps.filter(s => !s.exists)
    if (missing.length > 0) {
      return NextResponse.json(
        { error: 'Uno o más productos del carrito ya no existen' },
        { status: 400 }
      )
    }

    const resolvedItems = items.map((i, idx) => {
      const data = productSnaps[idx].data()!
      return {
        productId:   i.product.id,
        productName: String(data.name ?? ''),
        price:       Number(data.price) || 0,
        quantity:    i.quantity,
        image:       Array.isArray(data.images) ? (data.images[0] ?? '') : '',
        shortDesc:   String(data.shortDesc ?? data.name ?? ''),
      }
    })

    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // ── Subtotal, siempre calculado con el precio real de Firestore ──
    const subtotal = resolvedItems.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    )

    // ── Leer configuración de envío desde Firestore ────────────────
    const settingsSnap = await adminDb.collection('settings').doc('shipping').get()
    const settingsData = settingsSnap.exists ? settingsSnap.data()! : {}

    const freeShippingThreshold =
      typeof settingsData.freeShippingMinimum === 'number'
        ? settingsData.freeShippingMinimum
        : FALLBACK_FREE_SHIPPING_THRESHOLD

    const configuredShippingCost =
      typeof settingsData.shippingCost === 'number'
        ? settingsData.shippingCost
        : FALLBACK_SHIPPING_COST

    // ── Calcular costo de envío según método (nunca se confía en el cliente) ──
    let shipping = 0
    let shippingPending = false

    if (deliveryMethod === 'envio_caba_gba') {
      shipping = subtotal >= freeShippingThreshold ? 0 : configuredShippingCost
    } else if (deliveryMethod === 'envio_interior') {
      shipping = 0
      shippingPending = true
    }
    // deliveryMethod === 'retiro' → shipping queda en 0

    const total = subtotal + shipping

    // ── Crear orden en Firestore (Admin SDK: bypassea las security rules) ──
    const orderRef = await adminDb.collection('orders').add({
      userId,
      items: resolvedItems.map(({ productId, productName, price, quantity, image }) => ({
        productId, productName, price, quantity, image,
      })),
      deliveryMethod,
      ...(deliveryMethod !== 'retiro' && shippingAddress ? { shippingAddress } : {}),
      ...(deliveryMethod === 'retiro' && pickupContact ? { pickupContact } : {}),
      shippingCost:    shipping,
      shippingPending,
      total,
      status:    'pendiente',
      createdAt: FieldValue.serverTimestamp(),
    })

    const orderId = orderRef.id

    // ── Armar items para Mercado Pago con el precio ya revalidado ──
    const mpItems: {
      id:          string
      title:       string
      quantity:    number
      unit_price:  number
      currency_id: string
      description: string
    }[] = resolvedItems.map(i => ({
      id:          i.productId,
      title:       i.productName,
      quantity:    i.quantity,
      unit_price:  i.price,
      currency_id: 'ARS',
      description: i.shortDesc,
    }))

    // Agregar envío como item solo si corresponde cobrarlo ahora
    if (shipping > 0) {
      mpItems.push({
        id:          'envio',
        title:       'Costo de envío',
        quantity:    1,
        unit_price:  shipping,
        currency_id: 'ARS',
        description: 'Envío a domicilio',
      })
    }

    // ── Crear preferencia en Mercado Pago ──────────────────────────
    const preference = new Preference(client)

    const result = await preference.create({
      body: {
        items: mpItems,
        back_urls: {
          success: `${BASE_URL}/orden-confirmada`,
          failure: `${BASE_URL}/checkout`,
          pending: `${BASE_URL}/orden-confirmada`,
        },
        external_reference: orderId,
        expires:            true,
        expiration_date_to: new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    })

    return NextResponse.json({
      preferenceId: result.id,
      orderId,
    })

  } catch (err) {
    console.error('Error en crear-preferencia:', err)
    return NextResponse.json(
      { error: 'No se pudo procesar el pedido' },
      { status: 500 }
    )
  }
}
