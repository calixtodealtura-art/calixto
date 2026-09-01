'use client'

import { useEffect, useState }        from 'react'
import Link                            from 'next/link'
import { collection, getDocs,
         orderBy, query, doc,
         deleteDoc }                   from 'firebase/firestore'
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'
import { db }                          from '@/lib/firebase'
import { normalizeProduct, getProductsPage } from '@/lib/firestore'
import { formatPrice }                 from '@/lib/utils'
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react'
import toast                           from 'react-hot-toast'
import LoadMoreButton                  from '@/components/ui/LoadMoreButton'
import type { Product }                from '@/types'

const PAGE_SIZE = 20

export default function AdminProductosPage() {
  // Vista paginada (sin búsqueda activa)
  const [products, setProducts]       = useState<Product[]>([])
  const [lastDoc, setLastDoc]         = useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [hasMore, setHasMore]         = useState(false)
  const [loading, setLoading]         = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Búsqueda: trae el catálogo completo una sola vez (cacheado) para que
  // busque sobre todo, no solo sobre lo ya paginado.
  const [search, setSearch]               = useState('')
  const [allProducts, setAllProducts]     = useState<Product[] | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)

  // loading ya arranca en true (useState) — no hace falta volver a setearlo acá.
  useEffect(() => {
    (async () => {
      try {
        const page = await getProductsPage({ limitN: PAGE_SIZE })
        setProducts(page.items)
        setLastDoc(page.lastDoc)
        setHasMore(page.hasMore)
      } catch (err) {
        console.error(err)
        toast.error('Error cargando productos')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function handleLoadMore() {
    if (!lastDoc) return
    setLoadingMore(true)
    try {
      const page = await getProductsPage({ limitN: PAGE_SIZE, startAfterDoc: lastDoc })
      setProducts(prev => [...prev, ...page.items])
      setLastDoc(page.lastDoc)
      setHasMore(page.hasMore)
    } catch (err) {
      console.error(err)
      toast.error('Error cargando más productos')
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    if (!search || allProducts) return
    let active = true

    async function fetchAll() {
      setSearchLoading(true)
      try {
        const snap = await getDocs(
          query(collection(db, 'products'), orderBy('createdAt', 'desc'))
        )
        if (active) setAllProducts(snap.docs.map(d => normalizeProduct(d.id, d.data())))
      } catch (err) {
        console.error(err)
        if (active) toast.error('No se pudo cargar el catálogo completo para buscar')
      } finally {
        if (active) setSearchLoading(false)
      }
    }
    fetchAll()
    return () => { active = false }
  }, [search, allProducts])

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return
    try {
      await deleteDoc(doc(db, 'products', id))
      setProducts(prev => prev.filter(p => p.id !== id))
      setAllProducts(prev => prev ? prev.filter(p => p.id !== id) : prev)
      toast.success('Producto eliminado')
    } catch {
      toast.error('No se pudo eliminar')
    }
  }

  const isSearching = search.trim().length > 0
  const sourceList   = isSearching ? (allProducts ?? []) : products

  // Filtrar por nombre, categoría o badge
  const filtered = isSearching
    ? sourceList.filter(p => {
        const q = search.toLowerCase()
        return (
          p.name.toLowerCase().includes(q)     ||
          p.category.toLowerCase().includes(q) ||
          (p.badge ?? '').toLowerCase().includes(q)
        )
      })
    : sourceList

  const showSkeleton = loading || (isSearching && searchLoading && !allProducts)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
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
                     hover:bg-orange transition-all duration-200"
        >
          <Plus size={14} />
          Nuevo producto
        </Link>
      </div>

      {/* Buscador */}
      <div className="relative mb-6 max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, categoría o badge…"
          className="w-full border border-cream-warm bg-white pl-9 pr-10 py-2.5
                     text-sm text-green-deep font-light
                     focus:outline-none focus:border-orange transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2
                       text-gray-400 hover:text-green-deep transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {showSkeleton ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 bg-cream-warm animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-green-olive font-light">
          {isSearching
            ? <>No se encontraron productos para <strong>&quot;{search}&quot;</strong></>
            : <>No hay productos todavía.{' '}
                <Link href="/admin/productos/nuevo" className="underline">Crear el primero</Link>
              </>
          }
        </div>
      ) : (
        <>
          {/* Contador */}
          {isSearching && (
            <p className="text-[11px] text-gray-400 font-light mb-3">
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} para &quot;{search}&quot;
            </p>
          )}

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
            {filtered.map(product => (
              <div
                key={product.id}
                className="grid grid-cols-[2fr_1fr_80px_80px_80px] gap-4 items-center
                           px-5 py-3.5 border-b border-cream-warm last:border-0
                           hover:bg-cream/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    product.category === 'aceites'    ? 'bg-green-olive' :
                    product.category === 'varietales' ? 'bg-green-sage'  :
                    product.category === 'acetos'     ? 'bg-terra'       :
                    product.category === 'aceitunas'  ? 'bg-green-mid'   :
                    'bg-orange'
                  }`} />
                  <div className="min-w-0">
                    <p className="text-sm text-green-deep font-light truncate">{product.name}</p>
                    {product.badge && (
                      <p className="text-[10px] text-orange font-light">{product.badge}</p>
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
                  ${product.stock === 0 ? 'text-red-600 font-medium' :
                    product.stock < 5   ? 'text-yellow-600'          : 'text-green-olive'}`}>
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
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!isSearching && (
            <p className="text-[11px] text-gray-400 font-light mt-3 text-right">
              {products.length} producto{products.length !== 1 ? 's' : ''} cargados
            </p>
          )}

          <LoadMoreButton onClick={handleLoadMore} loading={loadingMore} hidden={isSearching || !hasMore} />
        </>
      )}
    </div>
  )
}
