import { NextRequest, NextResponse }     from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { collection, addDoc, doc, getDoc, Timestamp } from 'firebase/firestore'
import { db }                             from '@/lib/firebase'
import type { CartItem, ShippingAddress, PickupContact, DeliveryMethod } from '@/types'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

// Fallbacks solo por si no existe el documento de configuración en Firestore
const FALLBACK_FREE_SHIPPING_THRESHOLD = 120_000
const FALLBACK_SHIPPING_COST            = 1_500

export async function POST(req: NextRequest) {
  try {
    const {
      items,
      deliveryMethod,
      shippingAddress,
      pickupContact,
      userId,
    }: {
      items:            CartItem[]
      deliveryMethod:   DeliveryMethod
      shippingAddress?: ShippingAddress
      pickupContact?:   PickupContact
      userId:           string
    } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'El carrito está vacío' },
        { status: 400 }
      )
    }

    if (!deliveryMethod) {
      return NextResponse.json(
        { error: 'Falta indicar el método de entrega' },
        { status: 400 }
      )
    }

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

    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // ── Subtotal (siempre recalculado en el servidor) ──────────────
    const subtotal = items.reduce(
      (sum, i) => sum + i.product.price * i.quantity,
      0
    )

    // ── Leer configuración de envío desde Firestore ────────────────
    const settingsSnap = await getDoc(doc(db, 'settings', 'shipping'))
    const settingsData = settingsSnap.exists() ? settingsSnap.data() : {}

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

    // ── Crear orden en Firestore ───────────────────────────────────
    const orderRef = await addDoc(collection(db, 'orders'), {
      userId,
      items: items.map(i => ({
        productId:   i.product.id,
        productName: i.product.name,
        price:       Number(i.product.price),
        quantity:    i.quantity,
        image:       i.product.images?.[0] ?? '',
      })),
      deliveryMethod,
      ...(deliveryMethod !== 'retiro' && shippingAddress ? { shippingAddress } : {}),
      ...(deliveryMethod === 'retiro' && pickupContact ? { pickupContact } : {}),
      shippingCost:    shipping,
      shippingPending,
      total,
      status:    'pendiente',
      createdAt: Timestamp.now(),
    })

    const orderId = orderRef.id

    // ── Armar items para Mercado Pago ──────────────────────────────
    const mpItems: {
      id:          string
      title:       string
      quantity:    number
      unit_price:  number
      currency_id: string
      description: string
    }[] = items.map(({ product, quantity }) => ({
      id:          product.id,
      title:       product.name,
      quantity:    Number(quantity),
      unit_price:  Number(product.price),
      currency_id: 'ARS',
      description: product.shortDesc || product.name,
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