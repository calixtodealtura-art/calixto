'use client'

import { useRouter, useParams } from 'next/navigation'
import { useProductForm } from '@/hooks/useProductForm'
import ProductImagesField from '@/components/admin/ProductImagesField'
import { formatPrice } from '@/lib/utils'
import type { ProductCategory } from '@/types'

const CATEGORIES: ProductCategory[] = [
  'aceites', 'varietales', 'acetos', 'aceitunas', 'especiales'
]

export default function ProductFormPage() {
  const router = useRouter()
  const params  = useParams()
  const id      = params.id as string
  const isNew   = id === 'nuevo'

  const { form, setForm, loading, saving, handleChange, handleSubmit } = useProductForm(id, isNew)

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
              value={form.price === 0 ? '' : form.price}
              onChange={handleChange} className={inputCls}
              placeholder="0" />
          </Field>
          <Field label="Precio anterior (tachado)">
            <input name="oldPrice" type="number" min={0}
              value={form.oldPrice ? form.oldPrice : ''}
              onChange={handleChange} className={inputCls} />
          </Field>
          <Field label="Stock">
            <input name="stock" type="number" min={0}
              value={form.stock === 0 ? '' : form.stock}
              onChange={handleChange} className={inputCls}
              placeholder="0" />
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

        <ProductImagesField
          images={form.images}
          onChange={images => setForm(prev => ({ ...prev, images }))}
        />

        {Number(form.price) > 0 && (
          <div className="bg-cream p-4 border border-cream-warm">
            <p className="text-[10px] tracking-[0.2em] uppercase text-green-olive mb-1 font-light">
              Preview precio
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-2xl font-semibold text-green-deep">
                {formatPrice(Number(form.price))}
              </span>
              {form.oldPrice ? (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(Number(form.oldPrice))}
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
