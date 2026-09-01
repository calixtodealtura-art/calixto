'use client'

import { useState } from 'react'

interface UploadSignature {
  signature: string
  timestamp: number
  apiKey:    string
  cloudName: string
  folder:    string
}

// Sube un archivo a Cloudinary firmando la subida server-side
// (vía /api/upload-signature), con progreso.
export function useCloudinaryUpload() {
  const [uploading, setUploading] = useState(false)
  const [uploadPct, setUploadPct] = useState(0)

  async function upload(file: File): Promise<string> {
    setUploading(true)
    setUploadPct(0)
    try {
      const sigRes = await fetch('/api/upload-signature', { method: 'POST' })
      if (!sigRes.ok) throw new Error('No se pudo firmar la subida')
      const { signature, timestamp, apiKey, cloudName, folder }: UploadSignature = await sigRes.json()

      const formData = new FormData()
      formData.append('file',      file)
      formData.append('api_key',   apiKey)
      formData.append('timestamp', String(timestamp))
      formData.append('signature', signature)
      formData.append('folder',    folder)

      // XMLHttpRequest en vez de fetch para tener progreso de subida
      return await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', e => {
          if (e.lengthComputable) {
            setUploadPct(Math.round((e.loaded / e.total) * 100))
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText)
            resolve(data.secure_url)
          } else {
            reject(new Error('Error al subir imagen'))
          }
        })

        xhr.addEventListener('error', () => reject(new Error('Error de red')))

        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`)
        xhr.send(formData)
      })
    } finally {
      setUploading(false)
      setUploadPct(0)
    }
  }

  return { uploading, uploadPct, upload }
}
