'use client'

import { useRef } from 'react'
import { X, ImagePlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload'

interface Props {
  images:   string[]
  onChange: (images: string[]) => void
}

export default function ProductImagesField({ images, onChange }: Props) {
  const { uploading, uploadPct, upload } = useCloudinaryUpload()
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar 5MB')
      return
    }

    try {
      const url = await upload(file)
      onChange([...images, url])
      toast.success('Imagen subida')
    } catch (err) {
      console.error(err)
      toast.error('No se pudo subir la imagen')
    } finally {
      // Limpiar el input para poder subir la misma imagen de nuevo
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleRemoveImage(url: string) {
    // Solo sacamos la URL del form (Cloudinary no requiere borrado explícito en el free tier)
    onChange(images.filter(i => i !== url))
  }

  return (
    <div>
      <p className="text-[11px] tracking-[0.15em] uppercase text-green-olive mb-3 font-light">
        Imágenes
      </p>

      <div className="flex flex-wrap gap-3 mb-3">
        {images.map(url => (
          <div key={url} className="relative w-24 h-24">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemoveImage(url)}
              className="absolute -top-2 -right-2 bg-terra text-white
                         w-5 h-5 rounded-full flex items-center justify-center
                         hover:bg-red-700 transition-colors"
            >
              <X size={10} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-24 h-24 border-2 border-dashed border-cream-warm
                     flex flex-col items-center justify-center gap-1
                     text-gray-400 hover:border-gold hover:text-gold
                     transition-colors disabled:opacity-50 cursor-pointer"
        >
          {uploading ? (
            <span className="text-xs font-medium text-green-olive">{uploadPct}%</span>
          ) : (
            <>
              <ImagePlus size={20} strokeWidth={1.5} />
              <span className="text-[10px]">Subir</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelected}
      />
      <p className="text-[11px] text-gray-400 font-light">
        JPG, PNG o WEBP · Máximo 5MB · Las imágenes se guardan en Cloudinary
      </p>
    </div>
  )
}
