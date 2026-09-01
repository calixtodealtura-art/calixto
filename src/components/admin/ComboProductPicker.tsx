'use client'

import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'

interface Props {
  products:   Product[]
  excludeIds: string[]
  onSelect:   (product: Product) => void
}

export default function ComboProductPicker({ products, excludeIds, onSelect }: Props) {
  const [search, setSearch] = useState('')

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    !excludeIds.includes(p.id)
  )

  function handleSelect(product: Product) {
    onSelect(product)
    setSearch('')
  }

  return (
    <div>
      {/* Buscador */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar producto para agregar…"
          className="w-full border border-cream-warm bg-white px-3 py-2.5 pl-9
                     text-sm text-green-deep font-light
                     focus:outline-none focus:border-orange transition-colors"
        />
      </div>

      {/* Resultados de búsqueda */}
      {search && filteredProducts.length > 0 && (
        <div className="border border-cream-warm bg-white mb-3 max-h-48 overflow-y-auto">
          {filteredProducts.slice(0, 8).map(product => (
            <button
              key={product.id}
              type="button"
              onClick={() => handleSelect(product)}
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
    </div>
  )
}
