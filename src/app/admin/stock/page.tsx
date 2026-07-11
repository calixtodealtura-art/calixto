'use client'

import { useEffect, useState } from 'react'
import {
  collection, getDocs, orderBy, query,
  doc, updateDoc, addDoc, Timestamp,
} from 'firebase/firestore'
import { db }          from '@/lib/firebase'
import { formatPrice } from '@/lib/utils'
import { Printer, Search, Plus, Check, X } from 'lucide-react'
import toast           from 'react-hot-toast'
import type { Product } from '@/types'

type StockFilter = 'todos' | 'critico' | 'bajo' | 'ok'
type Tab         = 'stock' | 'historial'

interface StockEntry {
  id:          string
  productId:   string
  productName: string
  quantity:    number
  createdAt:   Date
}

function getStockStatus(stock: number, threshold: number) {
  if (stock === 0)        return { label: 'Sin stock',  color: 'bg-red-100 text-red-700',      dot: 'bg-red-500',    filter: 'critico' as StockFilter }
  if (stock <= threshold) return { label: 'Stock bajo', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400', filter: 'bajo'    as StockFilter }
  return                         { label: 'OK',         color: 'bg-green-100 text-green-700',   dot: 'bg-green-500',  filter: 'ok'      as StockFilter }
}

export default function StockPage() {
  const [tab,       setTab]       = useState<Tab>('stock')
  const [products,  setProducts]  = useState<Product[]>([])
  const [entries,   setEntries]   = useState<StockEntry[]>([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState<StockFilter>('todos')
  const [threshold, setThreshold] = useState(5)
  const [inputVal,  setInputVal]  = useState('5')
  const [search,    setSearch]    = useState('')

  // Edición inline de stock
  const [editingId,  setEditingId]  = useState<string | null>(null)
  const [editingQty, setEditingQty] = useState<number>(0)
  const [saving,     setSaving]     = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [productsSnap, entriesSnap] = await Promise.all([
        getDocs(query(collection(db, 'products'), orderBy('stock', 'asc'))),
        getDocs(query(collection(db, 'stock_entries'), orderBy('createdAt', 'desc'))),
      ])
      setProducts(productsSnap.docs.map(d => ({ ...d.data(), id: d.id }) as Product))
      setEntries(entriesSnap.docs.map(d => ({
        ...d.data(),
        id:        d.id,
        createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
      })) as StockEntry[])
    } finally {
      setLoading(false)
    }
  }

  function handleThresholdChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setInputVal(val)
    const num = parseInt(val)
    if (!isNaN(num) && num >= 0) setThreshold(num)
  }

  // Iniciar edición inline
  function startEdit(product: Product) {
    setEditingId(product.id)
    setEditingQty(0) // cantidad a SUMAR, no el stock total
  }

  function cancelEdit() {
    setEditingId(null)
    setEditingQty(0)
  }

  // Guardar ingreso de stock
  async function saveEntry(product: Product) {
    if (editingQty <= 0) {
      toast.error('La cantidad debe ser mayor a 0')
      return
    }
    setSaving(true)
    try {
      const newStock = product.stock + editingQty

      // Actualizar stock del producto
      await updateDoc(doc(db, 'products', product.id), { stock: newStock })

      // Registrar en historial
      await addDoc(collection(db, 'stock_entries'), {
        productId:   product.id,
        productName: product.name,
        quantity:    editingQty,
        createdAt:   Timestamp.now(),
      })

      // Actualizar estado local
      setProducts(prev => prev.map(p =>
        p.id === product.id ? { ...p, stock: newStock } : p
      ))
      setEntries(prev => [{
        id:          Date.now().toString(),
        productId:   product.id,
        productName: product.name,
        quantity:    editingQty,
        createdAt:   new Date(),
      }, ...prev])

      toast.success(`+${editingQty} unidades agregadas a ${product.name}`)
      cancelEdit()
    } catch {
      toast.error('Error al actualizar el stock')
    } finally {
      setSaving(false)
    }
  }

  // Filtros
  const filteredProducts = products
    .filter(p => {
      const matchesFilter = filter === 'todos' || getStockStatus(p.stock, threshold).filter === filter
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                            p.category.toLowerCase().includes(search.toLowerCase())
      return matchesFilter && matchesSearch
    })

  const needsRestock = products.filter(p => p.stock <= threshold)

  const counts = {
    critico: products.filter(p => p.stock === 0).length,
    bajo:    products.filter(p => p.stock > 0 && p.stock <= threshold).length,
    ok:      products.filter(p => p.stock > threshold).length,
  }

  function handlePrint() {
    const printWindow = window.open('', '_blank', 'width=900,height=700')
    if (!printWindow) return

    const rows = needsRestock.map((product, idx) => `
      <tr style="background:${idx % 2 === 0 ? '#fafaf8' : 'white'}">
        <td style="padding:10px 14px;font-size:13px;border-bottom:1px solid #eee">${product.name}</td>
        <td style="padding:10px 14px;font-size:12px;color:#666;text-transform:capitalize;border-bottom:1px solid #eee">${product.category}</td>
        <td style="padding:10px 14px;font-size:14px;font-weight:600;text-align:right;border-bottom:1px solid #eee;color:${product.stock === 0 ? '#dc2626' : '#ca8a04'}">${product.stock}</td>
        <td style="padding:10px 14px;text-align:center;border-bottom:1px solid #eee">
          <span style="font-size:10px;text-transform:uppercase;padding:3px 10px;font-weight:500;background:${product.stock === 0 ? '#fee2e2' : '#fef9c3'};color:${product.stock === 0 ? '#b91c1c' : '#854d0e'}">${product.stock === 0 ? 'Sin stock' : 'Stock bajo'}</span>
        </td>
        <td style="padding:10px 14px;border-bottom:1px solid #eee;border-left:1px dashed #ccc;min-width:80px"></td>
      </tr>
    `).join('')

    printWindow.document.write(`
      <!DOCTYPE html><html><head><meta charset="utf-8"/>
      <title>Calixto — Listado de reposición</title>
      <style>body{font-family:system-ui,sans-serif;color:#1a1a1a;padding:32px;margin:0}table{width:100%;border-collapse:collapse}</style>
      </head><body>
      <div style="border-bottom:2px solid #18532c;padding-bottom:16px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-end">
        <div>
          <p style="font-family:Georgia,serif;font-size:24px;color:#18532c;margin:0 0 4px">Calixto</p>
          <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#666;margin:0">Listado de reposición de stock</p>
        </div>
        <div style="text-align:right">
          <p style="font-size:11px;color:#666;margin:0 0 2px">Fecha: ${new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          <p style="font-size:11px;color:#666;margin:0">Stock mínimo: ${threshold} unidades</p>
        </div>
      </div>
      <div style="display:flex;gap:24px;margin-bottom:24px">
        <div style="padding:12px 20px;background:#fee2e2;border-left:3px solid #ef4444">
          <p style="font-size:20px;font-weight:600;color:#b91c1c;margin:0 0 2px">${counts.critico}</p>
          <p style="font-size:10px;text-transform:uppercase;color:#b91c1c;margin:0">Sin stock</p>
        </div>
        <div style="padding:12px 20px;background:#fef9c3;border-left:3px solid #eab308">
          <p style="font-size:20px;font-weight:600;color:#854d0e;margin:0 0 2px">${counts.bajo}</p>
          <p style="font-size:10px;text-transform:uppercase;color:#854d0e;margin:0">Stock bajo</p>
        </div>
        <div style="padding:12px 20px;background:#f5f5f5;border-left:3px solid #aaa">
          <p style="font-size:20px;font-weight:600;color:#333;margin:0 0 2px">${needsRestock.length}</p>
          <p style="font-size:10px;text-transform:uppercase;color:#333;margin:0">Total a reponer</p>
        </div>
      </div>
      <table><thead>
        <tr style="background:#18532c;color:#fff0dc">
          <th style="padding:10px 14px;text-align:left;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;font-weight:500">Producto</th>
          <th style="padding:10px 14px;text-align:left;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;font-weight:500">Categoría</th>
          <th style="padding:10px 14px;text-align:right;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;font-weight:500">Stock actual</th>
          <th style="padding:10px 14px;text-align:center;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;font-weight:500">Estado</th>
          <th style="padding:10px 14px;text-align:center;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;font-weight:500;border-left:1px dashed rgba(255,255,255,0.3)">Cant. a pedir</th>
        </tr>
      </thead><tbody>${rows}</tbody></table>
      <div style="margin-top:32px;padding-top:16px;border-top:1px solid #ddd;display:flex;justify-content:space-between;font-size:10px;color:#aaa">
        <span>Calixto — Panel de administración</span>
        <span>Generado el ${new Date().toLocaleDateString('es-AR')}</span>
      </div>
      </body></html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print(); printWindow.close() }, 500)
  }

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[11px] tracking-[0.2em] uppercase text-green-olive font-light mb-1">
            Panel de administración
          </p>
          <h1 className="font-serif text-3xl text-green-deep font-light">Control de stock</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-cream px-5 py-3 border border-cream-warm">
            <label className="text-[11px] tracking-[0.12em] uppercase text-green-olive font-light whitespace-nowrap">
              Stock mínimo
            </label>
            <input
              type="number" min={0} value={inputVal}
              onChange={handleThresholdChange}
              className="w-16 border border-cream-warm bg-white px-3 py-1.5 text-sm
                         text-green-deep font-medium text-center
                         focus:outline-none focus:border-orange transition-colors"
            />
            <span className="text-[11px] text-gray-400 font-light">unidades</span>
          </div>
          <button
            onClick={handlePrint}
            disabled={needsRestock.length === 0}
            className="flex items-center gap-2 px-5 py-3 text-[11px] tracking-widest
                       uppercase font-medium transition-all duration-200
                       bg-green-deep text-cream hover:bg-orange
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Printer size={15} strokeWidth={1.5} />
            Imprimir
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-8 border-b border-cream-warm">
        {([
          { key: 'stock',    label: 'Stock'             },
          { key: 'historial', label: 'Historial de ingresos' },
        ] as { key: Tab; label: string }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-6 py-3 text-[12px] tracking-[0.1em] uppercase font-medium
                        border-b-2 transition-all duration-200
                        ${tab === t.key
                          ? 'border-green-deep text-green-deep'
                          : 'border-transparent text-gray-400 hover:text-green-deep'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB STOCK ── */}
      {tab === 'stock' && (
        <>
          {/* Tarjetas resumen */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { key: 'critico', label: 'Sin stock',  count: counts.critico, bg: '#fee2e2', border: '#fca5a5', text: '#b91c1c', dot: '#ef4444' },
              { key: 'bajo',    label: 'Stock bajo', count: counts.bajo,    bg: '#fef9c3', border: '#fde047', text: '#854d0e', dot: '#eab308' },
              { key: 'ok',      label: 'OK',         count: counts.ok,      bg: '#dcfce7', border: '#86efac', text: '#166534', dot: '#22c55e' },
            ].map(card => (
              <button
                key={card.key}
                onClick={() => setFilter(filter === card.key as StockFilter ? 'todos' : card.key as StockFilter)}
                className="flex items-center gap-4 p-5 border-2 text-left transition-all
                           hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  backgroundColor: filter === card.key ? card.bg    : 'white',
                  borderColor:     filter === card.key ? card.border : '#ede5d4',
                }}
              >
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: card.dot }} />
                <div>
                  <p className="font-serif text-2xl font-normal leading-none" style={{ color: card.text }}>
                    {counts[card.key as keyof typeof counts]}
                  </p>
                  <p className="text-[11px] tracking-wide uppercase font-light mt-1" style={{ color: card.text }}>
                    {card.label}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Buscador + filtros */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            {/* Buscador */}
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar producto o categoría…"
                className="w-full border border-cream-warm bg-white pl-9 pr-4 py-2.5 text-sm
                           text-green-deep font-light focus:outline-none focus:border-orange
                           transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                             hover:text-green-deep transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filtros rápidos */}
            <div className="flex gap-2">
              {([
                { key: 'todos',   label: `Todos (${products.length})`   },
                { key: 'critico', label: `Sin stock (${counts.critico})` },
                { key: 'bajo',    label: `Stock bajo (${counts.bajo})`   },
                { key: 'ok',      label: `OK (${counts.ok})`             },
              ] as { key: StockFilter; label: string }[]).map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`text-[11px] tracking-[0.1em] uppercase px-3 py-2 border
                              transition-all font-light
                              ${filter === f.key
                                ? 'bg-green-deep text-cream border-green-deep'
                                : 'border-cream-warm text-green-deep hover:border-orange hover:text-orange'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tabla */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 bg-cream-warm animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-green-olive font-light">
              {search ? `No se encontraron productos para "${search}"` : 'No hay productos en esta categoría'}
            </div>
          ) : (
            <div className="bg-white border border-cream-warm">
              <div className="grid grid-cols-[2fr_1fr_100px_120px_180px] gap-4 px-5 py-3
                              border-b border-cream-warm
                              text-[10px] tracking-[0.2em] uppercase text-green-olive font-medium">
                <span>Producto</span>
                <span>Categoría</span>
                <span className="text-right">Stock</span>
                <span className="text-center">Estado</span>
                <span className="text-center">Agregar stock</span>
              </div>

              {filteredProducts.map(product => {
                const status   = getStockStatus(product.stock, threshold)
                const isEditing = editingId === product.id

                return (
                  <div
                    key={product.id}
                    className="grid grid-cols-[2fr_1fr_100px_120px_180px] gap-4 items-center
                               px-5 py-3.5 border-b border-cream-warm last:border-0
                               hover:bg-cream/20 transition-colors"
                  >
                    {/* Nombre */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${status.dot}`} />
                      <div className="min-w-0">
                        <p className="text-sm text-green-deep font-light truncate">{product.name}</p>
                        <p className="text-[11px] text-gray-400 font-light">{formatPrice(product.price)}</p>
                      </div>
                    </div>

                    {/* Categoría */}
                    <span className="text-xs text-gray-500 font-light capitalize">
                      {product.category}
                    </span>

                    {/* Stock actual */}
                    <span className={`text-right font-serif text-lg font-normal
                                      ${product.stock === 0        ? 'text-red-600'    :
                                        product.stock <= threshold ? 'text-yellow-600' : 'text-green-deep'}`}>
                      {product.stock}
                    </span>

                    {/* Badge estado */}
                    <div className="flex justify-center">
                      <span className={`text-[10px] tracking-wider uppercase px-3 py-1 font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Agregar stock inline */}
                    <div className="flex items-center justify-center gap-2">
                      {isEditing ? (
                        <>
                          <span className="text-[11px] text-gray-400 font-light">+</span>
                          <input
                            type="number"
                            min={1}
                            value={editingQty || ''}
                            onChange={e => setEditingQty(parseInt(e.target.value) || 0)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveEntry(product)
                              if (e.key === 'Escape') cancelEdit()
                            }}
                            autoFocus
                            placeholder="0"
                            className="w-16 border border-orange bg-white px-2 py-1.5 text-sm
                                       text-green-deep font-medium text-center
                                       focus:outline-none"
                          />
                          <button
                            onClick={() => saveEntry(product)}
                            disabled={saving}
                            className="text-green-olive hover:text-green-deep transition-colors
                                       disabled:opacity-50"
                            title="Confirmar"
                          >
                            <Check size={16} strokeWidth={2} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                            title="Cancelar"
                          >
                            <X size={16} strokeWidth={2} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startEdit(product)}
                          className="flex items-center gap-1.5 text-[11px] tracking-wide
                                     uppercase font-medium px-3 py-1.5 transition-all
                                     border border-green-deep/20 text-green-deep
                                     hover:border-orange hover:text-orange"
                        >
                          <Plus size={12} strokeWidth={2} />
                          Reponer
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!loading && counts.critico + counts.bajo > 0 && (
            <p className="text-[11px] text-gray-400 font-light mt-4 text-right">
              {counts.critico + counts.bajo} producto{counts.critico + counts.bajo !== 1 ? 's' : ''} requiere{counts.critico + counts.bajo !== 1 ? 'n' : ''} reposición
            </p>
          )}
        </>
      )}

      {/* ── TAB HISTORIAL ── */}
      {tab === 'historial' && (
        <>
          {entries.length === 0 ? (
            <div className="text-center py-24 text-green-olive font-light">
              No hay ingresos registrados todavía
            </div>
          ) : (
            <div className="bg-white border border-cream-warm">
              <div className="grid grid-cols-[2fr_1fr_120px] gap-4 px-5 py-3
                              border-b border-cream-warm
                              text-[10px] tracking-[0.2em] uppercase text-green-olive font-medium">
                <span>Producto</span>
                <span className="text-center">Unidades ingresadas</span>
                <span className="text-right">Fecha</span>
              </div>

              {entries.map(entry => (
                <div
                  key={entry.id}
                  className="grid grid-cols-[2fr_1fr_120px] gap-4 items-center
                             px-5 py-4 border-b border-cream-warm last:border-0
                             hover:bg-cream/20 transition-colors"
                >
                  <p className="text-sm text-green-deep font-light">{entry.productName}</p>

                  <div className="flex justify-center">
                    <span
                      className="font-serif text-lg font-semibold px-3 py-0.5"
                      style={{ color: '#18532c' }}
                    >
                      +{entry.quantity}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-400 font-light text-right">
                    {entry.createdAt instanceof Date
                      ? entry.createdAt.toLocaleDateString('es-AR', {
                          day:    '2-digit',
                          month:  'short',
                          year:   'numeric',
                          hour:   '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}