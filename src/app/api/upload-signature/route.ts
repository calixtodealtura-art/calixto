import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { isRequestFromAdmin } from '@/lib/adminAuth'

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
