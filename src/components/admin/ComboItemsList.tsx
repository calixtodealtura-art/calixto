'use client'

import { Trash2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { ComboItem } from '@/types'

interface Props {
  items:      ComboItem[]
  onUpdateQty: (productId: string, qty: number) => void
  onRemove:    (productId: string) => void
}

export default function ComboItemsList({ items, onUpdateQty, onRemove }: Props) {
  if (items.length === 0) {
    return (
      <div className="border-2 border-dashed border-cream-warm p-8 text-center">
        <p className="text-sm text-gray-400 font-light">
          Buscá productos arriba para agregarlos al combo
        </p>
      </div>
    )
  }

  return (
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
              onClick={() => onUpdateQty(item.productId, item.quantity - 1)}
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
              onClick={() => onUpdateQty(item.productId, item.quantity + 1)}
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
            onClick={() => onRemove(item.productId)}
            className="text-gray-300 hover:text-red-600 transition-colors"
          >
            <Trash2 size={14} strokeWidth={1.5} />
          </button>
        </div>
      ))}
    </div>
  )
}
