import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { CartItem, ShippingAddress } from '@/types'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export async function POST(req: NextRequest) {
  try {
    const {
      items,
      shippingAddress,
      total,
      userId,
    }: {
      items: CartItem[]
      shippingAddress: ShippingAddress
      total: number
      userId: string
    } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'El carrito está vacío' },
        { status: 400 }
      )
    }

    const BASE_URL =
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    console.log('BASE_URL:', BASE_URL)

    // 1️⃣ Crear orden en Firestore
    const orderRef = await addDoc(collection(db, 'orders'), {
      userId,
      items: items.map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        price: Number(i.product.price),
        quantity: i.quantity,
        image: i.product.images?.[0] ?? '',
      })),
      shippingAddress,
      total,
      status: 'pendiente',
      createdAt: Timestamp.now(),
    })

    const orderId = orderRef.id

    const preference = new Preference(client)

    const preferenceBody = {
      items: items.map(({ product, quantity }) => ({
        id: product.id,
        title: product.name,
        quantity: Number(quantity),
        unit_price: Number(product.price),
        currency_id: 'ARS',
        description: product.shortDesc || product.name,
      })),

      back_urls: {
        success: `${BASE_URL}/orden-confirmada`,
        failure: `${BASE_URL}/checkout`,
        pending: `${BASE_URL}/orden-confirmada`,
      },

      // ❌ SACAMOS auto_return porque rompe en sandbox

      external_reference: orderId,

      expires: true,
      expiration_date_to: new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString(),
    }

    console.log('Creando preferencia MP...')

    const result = await preference.create({
      body: preferenceBody,
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
