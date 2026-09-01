import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { cookies } from 'next/headers'
import { getAdminAuth, getAdminDb } from '@/lib/firebaseAdmin'

async function isRequestFromAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('calixto-admin-token')?.value
  if (!token) return false

  try {
    const decoded = await getAdminAuth().verifyIdToken(token)
    const snap = await getAdminDb().collection('users').doc(decoded.uid).get()
    return snap.exists && snap.data()?.role === 'admin'
  } catch {
    return false
  }
}

// Firma una subida a Cloudinary server-side, para no depender de un
// upload_preset "unsigned" expuesto en el bundle del cliente.
export async function POST() {
  if (!(await isRequestFromAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const apiKey    = process.env.CLOUDINARY_API_KEY
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  if (!apiSecret || !apiKey || !cloudName) {
    return NextResponse.json(
      { error: 'Cloudinary sin configurar: faltan CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET' },
      { status: 500 }
    )
  }

  const timestamp = Math.round(Date.now() / 1000)
  const folder    = 'calixto/products'

  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
  const signature = createHash('sha1').update(paramsToSign).digest('hex')

  return NextResponse.json({ signature, timestamp, apiKey, cloudName, folder })
}
