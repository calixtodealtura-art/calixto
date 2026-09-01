'use client'

import { useEffect, useState }   from 'react'
import { useRouter, useParams }  from 'next/navigation'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db }            from '@/lib/firebase'
import { normalizeProduct } from '@/lib/firestore'
import { useComboForm }  from '@/hooks/useComboForm'
import ComboProductPicker from '@/components/admin/ComboProductPicker'
import ComboItemsList     from '@/components/admin/ComboItemsList'
import { formatPrice }   from '@/lib/utils'
import type { Product }  from '@/types'

export default function ComboFormPage() {
  const router = useRouter()
  const params = useParams()
  const id     = params.id as string
  const isNew  = id === 'nuevo'

  const [products, setProducts] = useState<Product[]>([])

  // Cargar todos los productos disponibles para el buscador
  useEffect(() => {
    async function fetchProducts() {
      const snap = await getDocs(
        query(collection(db, 'products'), orderBy('name', 'asc'))
      )
      setProducts(snap.docs.map(d => normalizeProduct(d.id, d.data())))
    }
    fetchProducts()
  }, [])

  const {
    form, handleChange,
    items, addProduct, updateQty, removeItem,
    fullPrice, savings, savingsPct,
    loading, saving, handleSubmit,
  } = useComboForm(id, isNew)

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-cream-warm animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <p className="text-[11px] tracking-[0.2em] uppercase text-green-olive font-light mb-1">
          {isNew ? 'Nuevo combo' : 'Editar combo'}
        </p>
        <h1 className="font-serif text-3xl text-green-deep font-light">
          {isNew ? 'Crear combo' : form.name}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">

          {/* ── Columna izquierda ── */}
          <div className="space-y-6">

            {/* Nombre + Slug */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nombre del combo *">
                <input name="name" required value={form.name}
                  onChange={handleChange} className={inputCls}
                  placeholder="Kit Degustación Premium" />
              </Field>
              <Field label="Slug (auto)">
                <input name="slug" value={form.slug}
                  onChange={handleChange} className={`${inputCls} text-gray-400`} />
              </Field>
            </div>

            {/* Descripción */}
            <Field label="Descripción">
              <textarea name="description" value={form.description}
                onChange={handleChange} rows={3}
                className={`${inputCls} resize-none`}
                placeholder="Describí el combo y por qué es especial…" />
            </Field>

            {/* Badge + Checks */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Badge (ej: Más vendido)">
                <input name="badge" value={form.badge}
                  onChange={handleChange} className={inputCls} />
              </Field>
              <div className="flex flex-col gap-3 pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="featured" checked={form.featured}
                    onChange={handleChange} className="w-4 h-4 accent-green-deep" />
                  <span className="text-sm text-green-deep font-light">Destacado en home</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="active" checked={form.active}
                    onChange={handleChange} className="w-4 h-4 accent-green-deep" />
                  <span className="text-sm text-green-deep font-light">Combo activo (visible)</span>
                </label>
              </div>
            </div>

            {/* ── Productos del combo ── */}
            <div>
              <p className="text-[11px] tracking-[0.15em] uppercase text-green-olive font-light mb-3">
                Productos del combo *
              </p>

              <ComboProductPicker
                products={products}
                excludeIds={items.map(i => i.productId)}
                onSelect={addProduct}
              />

              <ComboItemsList items={items} onUpdateQty={updateQty} onRemove={removeItem} />
            </div>
          </div>

          {/* ── Columna derecha: precio ── */}
          <div className="space-y-5">
            <div
              className="p-6 sticky top-6"
              style={{ backgroundColor: '#fff0dc' }}
            >
              <p className="text-[10px] tracking-[0.2em] uppercase text-green-olive font-medium mb-5">
                Precio del combo
              </p>

              {/* Precio normal (calculado) */}
              <div className="mb-4 pb-4 border-b border-cream-warm">
                <p className="text-[10px] tracking-[0.12em] uppercase text-gray-400 font-light mb-1">
                  Precio normal (suma individual)
                </p>
                <p className="font-serif text-2xl text-gray-400 line-through font-light">
                  {formatPrice(fullPrice)}
                </p>
              </div>

              {/* Precio combo */}
              <Field label="Precio promocional *">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">$</span>
                  <input
                    name="comboPrice"
                    type="number"
                    min={0}
                    required
                    value={form.comboPrice || ''}
                    onChange={handleChange}
                    className={`${inputCls} font-serif text-xl font-semibold text-green-deep`}
                    placeholder="0"
                  />
                </div>
              </Field>

              {/* Ahorro */}
              {form.comboPrice > 0 && fullPrice > 0 && (
                <div className="mt-4 pt-4 border-t border-cream-warm">
                  {savings >= 0 ? (
                    <div
                      className="p-4 border-l-4"
                      style={{ borderColor: '#ed832b', backgroundColor: 'rgba(237,131,43,0.08)' }}
                    >
                      <p className="text-[10px] tracking-[0.12em] uppercase font-medium mb-1"
                         style={{ color: '#ed832b' }}>
                        El cliente ahorra
                      </p>
                      <p className="font-serif text-2xl font-semibold"
                         style={{ color: '#ed832b' }}>
                        {formatPrice(savings)}
                      </p>
                      <p className="text-[11px] text-gray-500 font-light mt-0.5">
                        {savingsPct}% de descuento
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-red-600 font-light">
                      ⚠ El precio del combo no puede superar el precio individual
                    </p>
                  )}
                </div>
              )}

              {/* Resumen items */}
              {items.length > 0 && (
                <div className="mt-5 pt-4 border-t border-cream-warm space-y-1.5">
                  <p className="text-[10px] tracking-[0.12em] uppercase text-gray-400 font-light mb-2">
                    Incluye
                  </p>
                  {items.map(item => (
                    <div key={item.productId} className="flex justify-between text-[12px]">
                      <span className="text-gray-600 font-light">
                        {item.quantity}x {item.productName}
                      </span>
                      <span className="text-green-deep font-light">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={saving || items.length < 2}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando…' : isNew ? 'Crear combo' : 'Guardar cambios'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/combos')}
                className="btn-secondary w-full"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

const inputCls = `w-full border border-cream-warm bg-white px-3 py-2.5
                  text-sm text-green-deep font-light
                  focus:outline-none focus:border-orange transition-colors`

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
