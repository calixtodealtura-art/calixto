'use client'

import { useEffect, useState }  from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getProducts }          from '@/lib/firestore'
import ProductCard              from '@/components/product/ProductCard'
import type { Product, ProductCategory } from '@/types'

const CATEGORIES: { slug: ProductCategory; label: string }[] = [
  { slug: 'aceites',    label: 'Aceites de Oliva'  },
  { slug: 'varietales', label: 'Varietales'         },
  { slug: 'acetos',     label: 'Acetos'             },
  { slug: 'aceitunas',  label: 'Aceitunas'          },
  { slug: 'especiales', label: 'Especiales Gourmet' },
]

export default function ProductosPage() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  const category = searchParams.get('categoria') as ProductCategory | null

  const [products, setProducts] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    setLoading(true)
    getProducts({ category: category ?? undefined })
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [category])

  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    router.push(val ? `/productos?categoria=${val}` : '/productos')
  }

  const currentLabel = CATEGORIES.find(c => c.slug === category)?.label ?? 'Todos los productos'

  return (
    <div className="min-h-screen bg-ivory">

      {/* Header */}
      <div
        className="px-8 md:px-20 py-14 border-b border-cream-warm"
        style={{ backgroundColor: '#fff0dc' }}
      >
        <p className="section-label">Catálogo completo</p>
        <h1 className="section-title">{currentLabel}</h1>
      </div>

      <div className="px-8 md:px-20 py-12">

        {/* Filtros */}
        <div className="flex items-center gap-4 mb-12 flex-wrap">

          {/* Botón Todos */}
          <button
            onClick={() => router.push('/productos')}
            className={`text-[11px] tracking-[0.15em] uppercase px-5 py-2.5 border
                        transition-all duration-200 font-light whitespace-nowrap
                        ${!category
                          ? 'bg-green-deep text-cream border-green-deep'
                          : 'border-green-deep/20 text-green-deep hover:border-orange hover:text-orange'}`}
          >
            Todos
          </button>

          {/* Dropdown */}
          <div className="relative">
            <select
              value={category ?? ''}
              onChange={handleCategoryChange}
              className={`appearance-none pl-4 pr-10 py-2.5 border text-[11px]
                          tracking-[0.15em] uppercase font-light cursor-pointer
                          transition-all duration-200 focus:outline-none bg-white
                          ${category
                            ? 'border-green-deep text-green-deep'
                            : 'border-green-deep/20 text-green-deep hover:border-orange'}`}
            >
              <option value="">Categoría</option>
              {CATEGORIES.map(cat => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.label}
                </option>
              ))}
            </select>
            {/* Flecha */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1L5 5L9 1" stroke="#18532c" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Indicador filtro activo */}
          {category && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-green-olive font-light">
                Filtrando por:
                <strong className="font-medium ml-1">
                  {CATEGORIES.find(c => c.slug === category)?.label}
                </strong>
              </span>
              <button
                onClick={() => router.push('/productos')}
                className="text-[11px] text-gray-400 hover:text-red-brand transition-colors"
                title="Quitar filtro"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-cream-warm" />
                <div className="p-5 border-t border-cream-warm space-y-2">
                  <div className="h-2 w-16 bg-cream-warm rounded" />
                  <div className="h-5 w-3/4 bg-cream-warm rounded" />
                  <div className="h-3 w-full bg-cream-warm rounded" />
                  <div className="h-6 w-1/3 bg-cream-warm rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="font-serif text-2xl text-green-olive mb-3">
              No hay productos en esta categoría
            </p>
            <p className="text-sm text-gray-400 font-light mb-8">
              Próximamente agregaremos más productos.
            </p>
            <button
              onClick={() => router.push('/productos')}
              className="btn-primary"
            >
              Ver todos los productos
            </button>
          </div>
        )}
      </div>
    </div>
  )
}