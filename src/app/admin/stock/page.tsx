'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db }          from '@/lib/firebase'
import { formatPrice } from '@/lib/utils'
import { Printer }     from 'lucide-react'
import type { Product } from '@/types'

type StockFilter = 'todos' | 'critico' | 'bajo' | 'ok'

function getStockStatus(stock: number, threshold: number): {
  label:  string
  color:  string
  dot:    string
  filter: StockFilter
} {
  if (stock === 0)        return { label: 'Sin stock',  color: 'bg-red-100 text-red-700',      dot: 'bg-red-500',    filter: 'critico' }
  if (stock <= threshold) return { label: 'Stock bajo', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400', filter: 'bajo'    }
  return                         { label: 'OK',         color: 'bg-green-100 text-green-700',   dot: 'bg-green-500',  filter: 'ok'      }
}

export default function StockPage() {
  const [products,  setProducts]  = useState<Product[]>([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState<StockFilter>('todos')
  const [threshold, setThreshold] = useState(5)
  const [inputVal,  setInputVal]  = useState('5')

  useEffect(() => {
    async function fetchProducts() {
      try {
        const snap = await getDocs(
          query(collection(db, 'products'), orderBy('stock', 'asc'))
        )
        setProducts(snap.docs.map(d => ({ ...d.data(), id: d.id }) as Product))
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  function handleThresholdChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setInputVal(val)
    const num = parseInt(val)
    if (!isNaN(num) && num >= 0) setThreshold(num)
  }

  function handlePrint() {
    window.print()
  }

  const filtered = products.filter(p => {
    if (filter === 'todos') return true
    return getStockStatus(p.stock, threshold).filter === filter
  })

  // Productos para imprimir: siempre los que necesitan reposición
  const needsRestock = products.filter(p => p.stock <= threshold)

  const counts = {
    critico: products.filter(p => p.stock === 0).length,
    bajo:    products.filter(p => p.stock > 0 && p.stock <= threshold).length,
    ok:      products.filter(p => p.stock > threshold).length,
  }

  return (
    <>
      {/* ── ESTILOS DE IMPRESIÓN ── */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area {
            position: fixed;
            top: 0; left: 0;
            width: 100%;
            padding: 32px;
            background: white;
          }
        }
      `}</style>

      <div className="p-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-green-olive font-light mb-1">
              Panel de administración
            </p>
            <h1 className="font-serif text-3xl text-green-deep font-light">
              Control de stock
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Umbral configurable */}
            <div className="flex items-center gap-3 bg-cream px-5 py-3 border border-cream-warm">
              <label className="text-[11px] tracking-[0.12em] uppercase text-green-olive font-light whitespace-nowrap">
                Stock mínimo
              </label>
              <input
                type="number"
                min={0}
                value={inputVal}
                onChange={handleThresholdChange}
                className="w-16 border border-cream-warm bg-white px-3 py-1.5 text-sm
                           text-green-deep font-medium text-center
                           focus:outline-none focus:border-orange transition-colors"
              />
              <span className="text-[11px] text-gray-400 font-light">unidades</span>
            </div>

            {/* Botón imprimir */}
            <button
              onClick={handlePrint}
              disabled={needsRestock.length === 0}
              className="flex items-center gap-2 px-5 py-3 text-[11px] tracking-widest
                         uppercase font-medium transition-all duration-200
                         bg-green-deep text-cream hover:bg-orange
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Printer size={15} strokeWidth={1.5} />
              Imprimir listado
            </button>
          </div>
        </div>

        {/* Tarjetas resumen */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { key: 'critico', label: 'Sin stock',  count: counts.critico, bg: '#fee2e2', border: '#fca5a5', text: '#b91c1c', dot: '#ef4444' },
            { key: 'bajo',    label: 'Stock bajo', count: counts.bajo,    bg: '#fef9c3', border: '#fde047', text: '#854d0e', dot: '#eab308' },
            { key: 'ok',      label: 'OK',         count: counts.ok,      bg: '#dcfce7', border: '#86efac', text: '#166534', dot: '#22c55e' },
          ].map(card => (
            <button
              key={card.key}
              onClick={() => setFilter(filter === card.key as StockFilter ? 'todos' : card.key as StockFilter)}
              className="flex items-center gap-4 p-5 border-2 text-left transition-all duration-200
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

        {/* Filtros rápidos */}
        <div className="flex gap-3 mb-6">
          {([
            { key: 'todos',   label: `Todos (${products.length})`   },
            { key: 'critico', label: `Sin stock (${counts.critico})` },
            { key: 'bajo',    label: `Stock bajo (${counts.bajo})`   },
            { key: 'ok',      label: `OK (${counts.ok})`             },
          ] as { key: StockFilter; label: string }[]).map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-[11px] tracking-[0.12em] uppercase px-4 py-2 border
                          transition-all duration-200 font-light
                          ${filter === f.key
                            ? 'bg-green-deep text-cream border-green-deep'
                            : 'border-cream-warm text-green-deep hover:border-orange hover:text-orange'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Tabla pantalla */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 bg-cream-warm animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-green-olive font-light">
            No hay productos en esta categoría
          </div>
        ) : (
          <div className="bg-white border border-cream-warm">
            <div className="grid grid-cols-[2fr_1fr_100px_120px] gap-4 px-5 py-3
                            border-b border-cream-warm
                            text-[10px] tracking-[0.2em] uppercase text-green-olive font-medium">
              <span>Producto</span>
              <span>Categoría</span>
              <span className="text-right">Stock</span>
              <span className="text-center">Estado</span>
            </div>

            {filtered.map(product => {
              const status = getStockStatus(product.stock, threshold)
              return (
                <div
                  key={product.id}
                  className="grid grid-cols-[2fr_1fr_100px_120px] gap-4 items-center
                             px-5 py-4 border-b border-cream-warm last:border-0
                             hover:bg-cream/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${status.dot}`} />
                    <div className="min-w-0">
                      <p className="text-sm text-green-deep font-light truncate">{product.name}</p>
                      <p className="text-[11px] text-gray-400 font-light">{formatPrice(product.price)}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 font-light capitalize">{product.category}</span>
                  <span className={`text-right font-serif text-lg font-normal
                                    ${product.stock === 0        ? 'text-red-600'    :
                                      product.stock <= threshold ? 'text-yellow-600' : 'text-green-deep'}`}>
                    {product.stock}
                  </span>
                  <div className="flex justify-center">
                    <span className={`text-[10px] tracking-wider uppercase px-3 py-1 font-medium ${status.color}`}>
                      {status.label}
                    </span>
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
      </div>

      {/* ── ÁREA DE IMPRESIÓN (invisible en pantalla, visible al imprimir) ── */}
      <div id="print-area" style={{ display: 'none' }}>
        <div style={{ fontFamily: 'Georgia, serif', color: '#1a1a1a', padding: '0' }}>

          {/* Encabezado */}
          <div style={{ borderBottom: '2px solid #18532c', paddingBottom: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ fontSize: '24px', fontWeight: '400', color: '#18532c', margin: '0 0 4px' }}>
                  Calixto
                </p>
                <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase',
                            color: '#666', margin: 0, fontFamily: 'system-ui' }}>
                  Listado de reposición de stock
                </p>
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'system-ui' }}>
                <p style={{ fontSize: '11px', color: '#666', margin: '0 0 2px' }}>
                  Fecha: {new Date().toLocaleDateString('es-AR', {
                    day: '2-digit', month: 'long', year: 'numeric'
                  })}
                </p>
                <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>
                  Stock mínimo configurado: {threshold} unidades
                </p>
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', fontFamily: 'system-ui' }}>
            <div style={{ padding: '12px 20px', background: '#fee2e2', borderLeft: '3px solid #ef4444' }}>
              <p style={{ fontSize: '20px', fontWeight: '600', color: '#b91c1c', margin: '0 0 2px' }}>
                {counts.critico}
              </p>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em',
                          color: '#b91c1c', margin: 0 }}>Sin stock</p>
            </div>
            <div style={{ padding: '12px 20px', background: '#fef9c3', borderLeft: '3px solid #eab308' }}>
              <p style={{ fontSize: '20px', fontWeight: '600', color: '#854d0e', margin: '0 0 2px' }}>
                {counts.bajo}
              </p>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em',
                          color: '#854d0e', margin: 0 }}>Stock bajo</p>
            </div>
            <div style={{ padding: '12px 20px', background: '#f5f5f5', borderLeft: '3px solid #aaa' }}>
              <p style={{ fontSize: '20px', fontWeight: '600', color: '#333', margin: '0 0 2px' }}>
                {needsRestock.length}
              </p>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em',
                          color: '#333', margin: 0 }}>Total a reponer</p>
            </div>
          </div>

          {/* Tabla */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'system-ui' }}>
            <thead>
              <tr style={{ backgroundColor: '#18532c', color: '#fff0dc' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px',
                             letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '500' }}>
                  Producto
                </th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px',
                             letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '500' }}>
                  Categoría
                </th>
                <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: '10px',
                             letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '500' }}>
                  Stock actual
                </th>
                <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '10px',
                             letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '500' }}>
                  Estado
                </th>
                <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '10px',
                             letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '500' }}>
                  Cant. a pedir
                </th>
              </tr>
            </thead>
            <tbody>
              {needsRestock.map((product, idx) => {
                const isCritico = product.stock === 0
                return (
                  <tr
                    key={product.id}
                    style={{ backgroundColor: idx % 2 === 0 ? '#fafaf8' : 'white' }}
                  >
                    <td style={{ padding: '10px 14px', fontSize: '13px', color: '#1a1a1a',
                                 borderBottom: '1px solid #eee' }}>
                      {product.name}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: '12px', color: '#666',
                                 textTransform: 'capitalize', borderBottom: '1px solid #eee' }}>
                      {product.category}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: '14px', fontWeight: '600',
                                 textAlign: 'right', borderBottom: '1px solid #eee',
                                 color: isCritico ? '#dc2626' : '#ca8a04' }}>
                      {product.stock}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                      <span style={{
                        fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em',
                        padding: '3px 10px', fontWeight: '500',
                        backgroundColor: isCritico ? '#fee2e2' : '#fef9c3',
                        color:           isCritico ? '#b91c1c' : '#854d0e',
                      }}>
                        {isCritico ? 'Sin stock' : 'Stock bajo'}
                      </span>
                    </td>
                    {/* Columna vacía para anotar a mano */}
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #eee',
                                 borderLeft: '1px dashed #ccc', minWidth: '80px' }} />
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Pie */}
          <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #ddd',
                        display: 'flex', justifyContent: 'space-between',
                        fontFamily: 'system-ui', fontSize: '10px', color: '#aaa' }}>
            <span>Calixto — Panel de administración</span>
            <span>Generado el {new Date().toLocaleDateString('es-AR')}</span>
          </div>
        </div>
      </div>
    </>
  )
}