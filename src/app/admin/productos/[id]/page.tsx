'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams }        from 'next/navigation'
import {
  doc, getDoc, addDoc, updateDoc,
  collection, Timestamp,
}                                      from 'firebase/firestore'
import {
  ref, uploadBytesResumable,
  getDownloadURL, deleteObject,
}                                      from 'firebase/storage'
import { db, storage }                 from '@/lib/firebase'
import { slugify, formatPrice }        from '@/lib/utils'
import { Upload, X, ImagePlus }        from 'lucide-react'
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
  const router    = useRouter()
  const params    = useParams()
  const id        = params.id as string
  const isNew     = id === 'nuevo'

  const [form,     setForm]     = useState(EMPTY)
  const [loading,  setLoading]  = useState(!isNew)
  const [saving,   setSaving]   = useState(false)
  const [uploading,setUploading]= useState(false)
  const [uploadPct,setUploadPct]= useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cargar producto existente
  useEffect(() => {
    if (isNew) return
    async function load() {
      try {
        const snap = await getDoc(doc(db, 'products', id))
        if (!snap.exists()) { toast.error('Producto no encontrado'); router.push('/admin/productos'); return }
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
      // Auto-generar slug desde el nombre
      if (name === 'name') updated.slug = slugify(value)
      return updated
    })
  }

  // Subir imagen a Firebase Storage
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadPct(0)

    const storageRef = ref(storage, `products/${Date.now()}-${file.name}`)
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      'state_changed',
      snap => setUploadPct(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      err  => { console.error(err); toast.error('Error subiendo imagen'); setUploading(false) },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref)
        setForm(prev => ({ ...prev, images: [...prev.images, url] }))
        setUploading(false)
        toast.success('Imagen subida')
      }
    )
  }

  async function handleRemoveImage(url: string) {
    try {
      const storageRef = ref(storage, url)
      await deleteObject(storageRef)
    } catch {
      // Si falla al borrar de Storage igual sacamos del form
    }
    setForm(prev => ({ ...prev, images: prev.images.filter(i => i !== url) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.price) { toast.error('Nombre y precio son obligatorios'); return }

    setSaving(true)
    try {
      if (isNew) {
        await addDoc(collection(db, 'products'), {
          ...form,
          tags:      form.tags,
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
      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] tracking-[0.2em] uppercase text-green-olive font-light mb-1">
          {isNew ? 'Nuevo producto' : 'Editar producto'}
        </p>
        <h1 className="font-serif text-3xl text-green-deep font-light">
          {isNew ? 'Crear producto' : form.name}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Nombre + Slug */}
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

        {/* Categoría + Badge */}
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

        {/* Descripción corta */}
        <Field label="Descripción corta (para la card)">
          <input name="shortDesc" value={form.shortDesc}
            onChange={handleChange} className={inputCls}
            placeholder="Primera prensada en frío · 500ml" />
        </Field>

        {/* Descripción larga */}
        <Field label="Descripción completa">
          <textarea name="description" value={form.description}
            onChange={handleChange} rows={4}
            className={`${inputCls} resize-none`} />
        </Field>

        {/* Precio + Precio anterior + Stock */}
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

        {/* Volumen + Origen + Acidez */}
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

        {/* Tags */}
        <Field label="Tags (separados por coma)">
          <input
            name="tags"
            value={form.tags.join(', ')}
            onChange={e => setForm(prev => ({
              ...prev,
              tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
            }))}
            className={inputCls}
            placeholder="virgen extra, mediterráneo, premium"
          />
        </Field>

        {/* Featured */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="featured"
            name="featured"
            checked={form.featured}
            onChange={handleChange}
            className="w-4 h-4 accent-green-deep"
          />
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

            {/* Upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-24 h-24 border-2 border-dashed border-cream-warm
                         flex flex-col items-center justify-center gap-1
                         text-gray-400 hover:border-gold hover:text-gold
                         transition-colors disabled:opacity-50"
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
            JPG, PNG o WEBP · Máximo 5MB por imagen
          </p>
        </div>

        {/* Preview precio */}
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

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando…' : isNew ? 'Crear producto' : 'Guardar cambios'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/productos')}
            className="btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

// Helpers de UI
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