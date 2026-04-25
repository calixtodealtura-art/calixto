'use client'

import { useEffect, useState }   from 'react'
import { useRouter, useParams }  from 'next/navigation'
import {
  collection, getDocs, orderBy, query,
  doc, getDoc, addDoc, updateDoc, Timestamp,
} from 'firebase/firestore'
import { db }          from '@/lib/firebase'
import { formatPrice, slugify } from '@/lib/utils'
import { Plus, Trash2, Search } from 'lucide-react'
import toast           from 'react-hot-toast'
import type { Product, Combo, ComboItem } from '@/types'

const EMPTY_COMBO = {
  name:        '',
  slug:        '',
  description: '',
  comboPrice:  0,
  badge:       '',
  featured:    false,
  active:      true,
}

export default function ComboFormPage() {
  const router = useRouter()
  const params = useParams()
  const id     = params.id as string
  const isNew  = id === 'nuevo'

  const [form,       setForm]       = useState(EMPTY_COMBO)
  const [items,      setItems]      = useState<ComboItem[]>([])
  const [products,   setProducts]   = useState<Product[]>([])
  const [search,     setSearch]     = useState('')
  const [loading,    setLoading]    = useState(!isNew)
  const [saving,     setSaving]     = useState(false)

  // Cargar todos los productos disponibles
  useEffect(() => {
    async function fetchProducts() {
      const snap = await getDocs(
        query(collection(db, 'products'), orderBy('name', 'asc'))
      )
      setProducts(snap.docs.map(d => ({ ...d.data(), id: d.id }) as Product))
    }
    fetchProducts()
  }, [])

  // Cargar combo existente si es edición
  useEffect(() => {
    if (isNew) return
    async function loadCombo() {
      try {
        const snap = await getDoc(doc(db, 'combos', id))
        if (!snap.exists()) { toast.error('Combo no encontrado'); router.push('/admin/combos'); return }
        const data = snap.data() as Combo
        setForm({
          name:        data.name,
          slug:        data.slug,
          description: data.description,
          comboPrice:  data.comboPrice,
          badge:       data.badge ?? '',
          featured:    data.featured,
          active:      data.active,
        })
        setItems(data.items)
      } finally {
        setLoading(false)
      }
    }
    loadCombo()
  }, [id, isNew, router])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
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

  // Agregar producto al combo
  function addProduct(product: Product) {
    const existing = items.find(i => i.productId === product.id)
    if (existing) {
      setItems(prev => prev.map(i =>
        i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
      ))
    } else {
      setItems(prev => [...prev, {
        productId:   product.id,
        productName: product.name,
        quantity:    1,
        unitPrice:   product.price,
      }])
    }
    setSearch('')
  }

  function updateQty(productId: string, qty: number) {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.productId !== productId))
    } else {
      setItems(prev => prev.map(i =>
        i.productId === productId ? { ...i, quantity: qty } : i
      ))
    }
  }

  function removeItem(productId: string) {
    setItems(prev => prev.filter(i => i.productId !== productId))
  }

  // Cálculos derivados
  const fullPrice = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const savings   = fullPrice - form.comboPrice
  const savingsPct = fullPrice > 0 ? Math.round((savings / fullPrice) * 100) : 0

  // Productos filtrados por búsqueda (excluye los ya agregados)
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    !items.find(i => i.productId === p.id)
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length < 2) { toast.error('El combo debe tener al menos 2 productos'); return }
    if (form.comboPrice <= 0) { toast.error('El precio del combo debe ser mayor a 0'); return }
    if (savings < 0) { toast.error('El precio del combo no puede ser mayor al precio individual'); return }

    setSaving(true)
    try {
      const comboData = {
        ...form,
        items,
        fullPrice,
        savings,
        images: [],
      }

      if (isNew) {
        await addDoc(collection(db, 'combos'), {
          ...comboData,
          createdAt: Timestamp.now(),
        })
        toast.success('Combo creado')
      } else {
        await updateDoc(doc(db, 'combos', id), comboData)
        toast.success('Combo actualizado')
      }
      router.push('/admin/combos')
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

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

              {/* Buscador */}
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar producto para agregar…"
                  className={`${inputCls} pl-9`}
                />
              </div>

              {/* Resultados de búsqueda */}
              {search && filteredProducts.length > 0 && (
                <div className="border border-cream-warm bg-white mb-3 max-h-48 overflow-y-auto">
                  {filteredProducts.slice(0, 8).map(product => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addProduct(product)}
                      className="w-full flex items-center justify-between px-4 py-3
                                 hover:bg-cream/50 transition-colors border-b border-cream-warm
                                 last:border-0 text-left"
                    >
                      <div>
                        <p className="text-sm text-green-deep font-light">{product.name}</p>
                        <p className="text-[11px] text-gray-400">{product.category}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-sm text-green-deep">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-green-olive">
                          <Plus size={14} />
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {search && filteredProducts.length === 0 && (
                <p className="text-sm text-gray-400 font-light mb-3 px-1">
                  No se encontraron productos
                </p>
              )}

              {/* Items seleccionados */}
              {items.length === 0 ? (
                <div className="border-2 border-dashed border-cream-warm p-8 text-center">
                  <p className="text-sm text-gray-400 font-light">
                    Buscá productos arriba para agregarlos al combo
                  </p>
                </div>
              ) : (
                <div className="border border-cream-warm bg-white">
                  {items.map((item, idx) => (
                    <div
                      key={item.productId}
                      className={`flex items-center gap-4 px-4 py-3
                                  border-b border-cream-warm last:border-0
                                  ${idx % 2 === 0 ? 'bg-white' : 'bg-cream/20'}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-green-deep font-light truncate">
                          {item.productName}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {formatPrice(item.unitPrice)} c/u
                        </p>
                      </div>

                      {/* Cantidad */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQty(item.productId, item.quantity - 1)}
                          className="w-7 h-7 bg-cream hover:bg-gold-light transition-colors
                                     flex items-center justify-center text-green-deep"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-green-deep">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.productId, item.quantity + 1)}
                          className="w-7 h-7 bg-cream hover:bg-gold-light transition-colors
                                     flex items-center justify-center text-green-deep"
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal */}
                      <span className="font-serif text-sm font-semibold text-green-deep w-20 text-right">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="text-gray-300 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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