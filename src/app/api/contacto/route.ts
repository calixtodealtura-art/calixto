import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminDb } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'

const bodySchema = z.object({
  name:    z.string().trim().min(1).max(120),
  email:   z.string().trim().email().max(200),
  subject: z.enum(['pedido', 'producto', 'envio', 'mayorista', 'otro']),
  message: z.string().trim().min(1).max(2000),
  // Honeypot: campo oculto que un usuario real nunca completa
  website: z.string().max(0).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const parsed = bodySchema.safeParse(await req.json())

    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const { name, email, subject, message, website } = parsed.data

    // Si el honeypot viene completo, es un bot: respondemos OK sin escribir nada
    if (website) {
      return NextResponse.json({ ok: true })
    }

    await getAdminDb().collection('contacts').add({
      name,
      email,
      subject,
      message,
      createdAt: FieldValue.serverTimestamp(),
      read: false,
    })

    return NextResponse.json({ ok: true })

  } catch (err) {
    console.error('Error en /api/contacto:', err)
    return NextResponse.json({ error: 'No se pudo enviar el mensaje' }, { status: 500 })
  }
}
