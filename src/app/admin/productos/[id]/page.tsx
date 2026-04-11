'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams }        from 'next/navigation'
import {
  doc, getDoc, addDoc, updateDoc,
  collection, Timestamp,
}                                      from 'firebase/firestore'
import { db }                          from '@/lib/firebase'
import { slugify, formatPrice }        from '@/lib/utils'
import { X, ImagePlus }                from 'lucide-react'
import toast                           from 'react-hot-toast'
import type { Product, ProductCategory } from '@/types'

const CATEGORIES: ProductCategory[] = [
  'aceites', 'varietales', 'acetos', 'aceitunas', 'salsas'
]

const EMPTY: Omit<Product, 'id' | 'createdAt'> = {
  name:        '',
  slug:        '',
  category:    'aceites',
  description: '',
  shortDesc:   '',
  price:       0,
  oldPrice:    undefined,
  images:      [],
  badge:       '',
  stock:       0,
  featured:    false,
  volume:      '',
  origin:      'San Juan, Argentina',
  acidity:     '',
  tags:        [],
}

export default function ProductFormPage() {
  const router   = useRouter()
  const params   = useParams()
  const id       = params.id as string
  const isNew    = id === 'nuevo'

  const [form,      setForm]      = useState(EMPTY)
  const [loading,   setLoading]   = useState(!isNew)
  const [saving,    setSaving]    = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadPct, setUploadPct] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cargar producto existente
  useEffect(() => {
    if (isNew) return
    async function load() {
      try {
        const snap = await getDoc(doc(db, 'products', id))
        if (!snap.exists()) {
          toast.error('Producto no encontrado')
          router.push('/admin/productos')
          return
        }
        const data = snap.data() as Product
        setForm({
          name:        data.name        ?? '',
          slug:        data.slug        ?? '',
          category:    data.category    ?? 'aceites',
          description: data.description ?? '',
          shortDesc:   data.shortDesc   ?? '',
          price:       data.price       ?? 0,
          oldPrice:    data.oldPrice,
          images:      data.images      ?? [],
          badge:       data.badge       ?? '',
          stock:       data.stock       ?? 0,
          featured:    data.featured    ?? false,
          volume:      data.volume      ?? '',
          origin:      data.origin      ?? '',
          acidity:     data.acidity     ?? '',
          tags:        data.tags        ?? [],
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, isNew, router])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target
    const val = type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : type === 'number' ? Number(value) : value

    setForm(prev => {
      const updated = { ...prev, [name]: val }
      if (name === 'name') updated.slug = slugify(value)
      return updated
    })
  }

  // ── Subida a Cloudinary (sin SDK, fetch directo) ──────────────
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamaño (5MB máx)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar 5MB')
      return
    }

    setUploading(true)
    setUploadPct(0)

    try {
      const cloudName   = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!

      const formData = new FormData()
      formData.append('file',         file)
      formData.append('upload_preset', uploadPreset)
      formData.append('folder',        'calixto/products')

      // Usamos XMLHttpRequest para tener progreso de subida
      const url = await new Promise<string>((resolve, reject) => {
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

      setForm(prev => ({ ...prev, images: [...prev.images, url] }))
      toast.success('Imagen subida')

    } catch (err) {
      console.error(err)
      toast.error('No se pudo subir la imagen')
    } finally {
      setUploading(false)
      setUploadPct(0)
      // Limpiar el input para poder subir la misma imagen de nuevo
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleRemoveImage(url: string) {
    // Solo sacamos la URL del form (Cloudinary no requiere borrado explícito en el free tier)
    setForm(prev => ({ ...prev, images: prev.images.filter(i => i !== url) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.price) {
      toast.error('Nombre y precio son obligatorios')
      return
    }

    setSaving(true)
    try {
      if (isNew) {
        await addDoc(collection(db, 'products'), {
          ...form,
          createdAt: Timestamp.now(),
        })
        toast.success('Producto creado')
      } else {
        await updateDoc(doc(db, 'products', id), { ...form })
        toast.success('Producto actualizado')
      }
      router.push('/admin/productos')
    } catch (err) {
      console.error(err)
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 bg-cream-warm animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <p className="text-[11px] tracking-[0.2em] uppercase text-green-olive font-light mb-1">
          {isNew ? 'Nuevo producto' : 'Editar producto'}
        </p>
        <h1 className="font-serif text-3xl text-green-deep font-light">
          {isNew ? 'Crear producto' : form.name}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="grid grid-cols-2 gap-4">
          <Field label="Nombre *">
            <input name="name" required value={form.name}
              onChange={handleChange} className={inputCls} />
          </Field>
          <Field label="Slug (auto)">
            <input name="slug" value={form.slug}
              onChange={handleChange} className={`${inputCls} text-gray-400`} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Categoría *">
            <select name="category" value={form.category}
              onChange={handleChange} className={inputCls}>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Badge (ej: Nuevo, Reserva)">
            <input name="badge" value={form.badge ?? ''}
              onChange={handleChange} className={inputCls} />
          </Field>
        </div>

        <Field label="Descripción corta (para la card)">
          <input name="shortDesc" value={form.shortDesc}
            onChange={handleChange} className={inputCls}
            placeholder="Primera prensada en frío · 500ml" />
        </Field>

        <Field label="Descripción completa">
          <textarea name="description" value={form.description}
            onChange={handleChange} rows={4}
            className={`${inputCls} resize-none`} />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Precio *">
            <input name="price" type="number" min={0} required
              value={form.price} onChange={handleChange} className={inputCls} />
          </Field>
          <Field label="Precio anterior (tachado)">
            <input name="oldPrice" type="number" min={0}
              value={form.oldPrice ?? ''}
              onChange={handleChange} className={inputCls} />
          </Field>
          <Field label="Stock">
            <input name="stock" type="number" min={0}
              value={form.stock} onChange={handleChange} className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Volumen (ej: 500ml)">
            <input name="volume" value={form.volume ?? ''}
              onChange={handleChange} className={inputCls} />
          </Field>
          <Field label="Origen">
            <input name="origin" value={form.origin ?? ''}
              onChange={handleChange} className={inputCls} />
          </Field>
          <Field label="Acidez (solo aceites)">
            <input name="acidity" value={form.acidity ?? ''}
              onChange={handleChange} className={inputCls} placeholder="0,3%" />
          </Field>
        </div>

        <Field label="Tags (separados por coma)">
          <input
            value={form.tags.join(', ')}
            onChange={e => setForm(prev => ({
              ...prev,
              tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
            }))}
            className={inputCls}
            placeholder="virgen extra, mediterráneo, premium"
          />
        </Field>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="featured" name="featured"
            checked={form.featured} onChange={handleChange}
            className="w-4 h-4 accent-green-deep" />
          <label htmlFor="featured"
            className="text-sm text-green-deep font-light cursor-pointer">
            Mostrar en productos destacados del home
          </label>
        </div>

        {/* Imágenes */}
        <div>
          <p className="text-[11px] tracking-[0.15em] uppercase text-green-olive mb-3 font-light">
            Imágenes
          </p>

          <div className="flex flex-wrap gap-3 mb-3">
            {form.images.map(url => (
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
            onChange={handleImageUpload}
          />
          <p className="text-[11px] text-gray-400 font-light">
            JPG, PNG o WEBP · Máximo 5MB · Las imágenes se guardan en Cloudinary
          </p>
        </div>

        {form.price > 0 && (
          <div className="bg-cream p-4 border border-cream-warm">
            <p className="text-[10px] tracking-[0.2em] uppercase text-green-olive mb-1 font-light">
              Preview precio
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-2xl font-semibold text-green-deep">
                {formatPrice(form.price)}
              </span>
              {form.oldPrice ? (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(form.oldPrice)}
                </span>
              ) : null}
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={saving}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? 'Guardando…' : isNew ? 'Crear producto' : 'Guardar cambios'}
          </button>
          <button type="button" onClick={() => router.push('/admin/productos')}
            className="btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

const inputCls = `w-full border border-cream-warm bg-white px-3 py-2.5
                  text-sm text-green-deep font-light
                  focus:outline-none focus:border-gold transition-colors`

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] tracking-[0.15em] uppercase
                        text-green-olive mb-1.5 font-light">
        {label}
      </label>
      {children}
    </div>
  )
}