import { NextRequest, NextResponse }     from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db }                             from '@/lib/firebase'
import type { CartItem, ShippingAddress } from '@/types'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

const FREE_SHIPPING_THRESHOLD = 120_000

export async function POST(req: NextRequest) {
  try {
    const {
      items,
      shippingAddress,
      total,
      userId,
    }: {
      items:           CartItem[]
      shippingAddress: ShippingAddress
      total:           number
      userId:          string
    } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'El carrito está vacío' },
        { status: 400 }
      )
    }

    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    console.log('BASE_URL:', BASE_URL)

    // ── Calcular costo de envío ────────────────────────────────────
    const subtotal = items.reduce(
      (sum, i) => sum + i.product.price * i.quantity,
      0
    )
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 1500

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
      shippingAddress,
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

    // Agregar envío como item solo si corresponde
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

    console.log('Creando preferencia MP...')

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

    console.log('Preferencia creada:', result.id)

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