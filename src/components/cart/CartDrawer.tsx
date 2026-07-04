'use client'

import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link  from 'next/link'
import { useCartStore } from '@/store/cartStore'
import { useShippingConfig } from '@/lib/hooks/useShippingConfig'
import {
  formatPrice,
  shippingProgress,
  remainingForFreeShipping,
} from '@/lib/utils'

export default function CartDrawer() {
  const {
    items, isOpen, closeCart,
    removeItem, updateQty,
    total, itemCount,
  } = useCartStore()

  const { threshold } = useShippingConfig()

  const cartTotal  = total()
  const cartCount  = itemCount()
  const progress   = threshold !== null ? shippingProgress(cartTotal, threshold) : 0
  const remaining  = threshold !== null ? remainingForFreeShipping(cartTotal, threshold) : 0

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-green-deep/50 backdrop-blur-sm z-40
                    transition-opacity duration-300
                    ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-[420px] bg-ivory z-50
                    flex flex-col shadow-2xl
                    transition-transform duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-label="Carrito de compras"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-cream-warm">
          <h2 className="font-serif text-2xl font-light text-green-deep">
            Tu carrito
          </h2>
          <button
            onClick={closeCart}
            className="text-green-deep hover:text-terra transition-colors"
            aria-label="Cerrar carrito"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-8 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
              <ShoppingBag size={48} strokeWidth={1} className="text-green-sage/40" />
              <p className="font-serif text-xl text-green-mid">Tu carrito está vacío</p>
              <p className="text-sm text-gray-400 font-light">
                Explorá nuestros productos gourmet
              </p>
              <button
                onClick={closeCart}
                className="btn-primary mt-4"
              >
                Ver productos
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-cream-warm">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex gap-4 py-5">
                  {/* Image */}
                  <div className="relative w-[72px] h-[72px] shrink-0 bg-cream overflow-hidden">
                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        🫒
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] tracking-[0.15em] uppercase text-green-olive font-light">
                      {product.category}
                    </p>
                    <p className="font-serif text-[1.05rem] text-green-deep mt-0.5 truncate">
                      {product.name}
                    </p>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2.5 mt-2.5">
                      <button
                        onClick={() => updateQty(product.id, quantity - 1)}
                        className="w-6 h-6 bg-cream hover:bg-gold-light transition-colors
                                   flex items-center justify-center"
                        aria-label="Quitar uno"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-medium text-green-deep w-5 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQty(product.id, quantity + 1)}
                        className="w-6 h-6 bg-cream hover:bg-gold-light transition-colors
                                   flex items-center justify-center"
                        aria-label="Agregar uno"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="text-gray-300 hover:text-terra transition-colors ml-1"
                        aria-label="Eliminar producto"
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="font-serif text-lg font-semibold text-green-deep shrink-0">
                    {formatPrice(product.price * quantity)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-8 py-6 border-t border-cream-warm bg-white">
            {/* Shipping progress */}
            {threshold !== null && (
              <>
                <div className="mb-1 h-[3px] bg-cream-warm rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-olive to-gold transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-400 font-light mb-5">
                  {remaining > 0 ? (
                    <>Agregá <strong className="text-green-olive">{formatPrice(remaining)}</strong> más para envío gratis</>
                  ) : (
                    <span className="text-green-olive font-medium">🎉 ¡Tenés envío gratis!</span>
                  )}
                </p>
              </>
            )}

            {/* Total */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-[11px] tracking-[0.15em] uppercase text-green-olive">
                Total ({cartCount} {cartCount === 1 ? 'producto' : 'productos'})
              </span>
              <span className="font-serif text-2xl font-semibold text-green-deep">
                {formatPrice(cartTotal)}
              </span>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn-primary w-full block text-center mb-3"
            >
              Finalizar compra
            </Link>
            <button
              onClick={closeCart}
              className="btn-secondary w-full text-center"
            >
              Seguir comprando
            </button>
          </div>
        )}
      </aside>
    </>
  )
}