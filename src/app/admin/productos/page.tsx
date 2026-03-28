'use client'

import { useEffect, useState }        from 'react'
import Link                            from 'next/link'
import { collection, getDocs,
         orderBy, query, doc,
         deleteDoc }                   from 'firebase/firestore'
import { db }                          from '@/lib/firebase'
import { formatPrice }                 from '@/lib/utils'
import { Plus, Pencil, Trash2 }        from 'lucide-react'
import toast                           from 'react-hot-toast'
import type { Product }                from '@/types'

export default function AdminProductosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      const snap = await getDocs(
        query(collection(db, 'products'), orderBy('createdAt', 'desc'))
      )
      setProducts(snap.docs.map(d => ({ ...d.data(), id: d.id }) as Product))
    } catch (err) {
      console.error(err)
      toast.error('Error cargando productos')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return
    try {
      await deleteDoc(doc(db, 'products', id))
      setProducts(prev => prev.filter(p => p.id !== id))
      toast.success('Producto eliminado')
    } catch {
      toast.error('No se pudo eliminar')
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[11px] tracking-[0.2em] uppercase text-green-olive font-light mb-1">
            Panel de administración
          </p>
          <h1 className="font-serif text-3xl text-green-deep font-light">Productos</h1>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="flex items-center gap-2 bg-green-deep text-cream
                     px-5 py-2.5 text-xs tracking-widest uppercase font-medium
                     hover:bg-gold hover:text-green-deep transition-all duration-200"
        >
          <Plus size={14} />
          Nuevo producto
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 bg-cream-warm animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 text-green-olive font-light">
          No hay productos todavía.{' '}
          <Link href="/admin/productos/nuevo" className="underline">Crear el primero</Link>
        </div>
      ) : (
        <div className="bg-white border border-cream-warm">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1fr_80px_80px_80px] gap-4
                          px-5 py-3 border-b border-cream-warm
                          text-[10px] tracking-[0.2em] uppercase text-green-olive font-medium">
            <span>Producto</span>
            <span>Categoría</span>
            <span className="text-right">Precio</span>
            <span className="text-right">Stock</span>
            <span></span>
          </div>

          {/* Rows */}
          {products.map(product => (
            <div
              key={product.id}
              className="grid grid-cols-[2fr_1fr_80px_80px_80px] gap-4 items-center
                         px-5 py-3.5 border-b border-cream-warm last:border-0
                         hover:bg-cream/30 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Color dot por categoría */}
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  product.category === 'aceites'    ? 'bg-green-olive' :
                  product.category === 'varietales' ? 'bg-green-sage'  :
                  product.category === 'acetos'     ? 'bg-terra'       :
                  product.category === 'aceitunas'  ? 'bg-green-mid'   :
                  'bg-gold'
                }`} />
                <div className="min-w-0">
                  <p className="text-sm text-green-deep font-light truncate">{product.name}</p>
                  {product.badge && (
                    <p className="text-[10px] text-gold font-light">{product.badge}</p>
                  )}
                </div>
              </div>

              <span className="text-xs text-gray-500 font-light capitalize">
                {product.category}
              </span>

              <span className="text-right font-serif text-sm font-semibold text-green-deep">
                {formatPrice(product.price)}
              </span>

              <span className={`text-right text-sm font-light
                ${product.stock === 0 ? 'text-terra font-medium' :
                  product.stock < 5   ? 'text-yellow-600' : 'text-green-olive'}`}>
                {product.stock}
              </span>

              <div className="flex items-center justify-end gap-2">
                <Link
                  href={`/admin/productos/${product.id}`}
                  className="text-gray-400 hover:text-green-deep transition-colors"
                  title="Editar"
                >
                  <Pencil size={14} strokeWidth={1.5} />
                </Link>
                <button
                  onClick={() => handleDelete(product.id, product.name)}
                  className="text-gray-400 hover:text-terra transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}