'use client'

import Image          from 'next/image'
import Link           from 'next/link'
import { ShoppingBag } from 'lucide-react'
import toast          from 'react-hot-toast'
import { useCartStore } from '@/store/cartStore'
import { formatPrice }  from '@/lib/utils'
import type { Product } from '@/types'
import { cn }           from '@/lib/utils'

interface ProductCardProps {
  product: Product
  className?: string
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const { addItem, openCart } = useCartStore()

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    addItem(product)
    toast.success(`${product.name} agregado al carrito`)
    openCart()
  }

  return (
    <article
      className={cn(
        'group bg-white relative flex flex-col transition-all duration-300',
        'hover:-translate-y-1.5 hover:shadow-[0_24px_48px_rgba(26,46,26,0.1)]',
        className
      )}
    >
      <Link href={`/producto/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-[3/4] bg-cream overflow-hidden">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl
                            bg-gradient-to-br from-cream to-cream-warm">
              🫒
            </div>
          )}

          {/* Badge */}
          {product.oldPrice ? (
            <span className="product-badge-sale">Oferta</span>
          ) : product.badge ? (
            <span className="product-badge">{product.badge}</span>
          ) : null}
        </div>

        {/* Info */}
        <div className="p-5 border-t border-cream-warm flex-1 flex flex-col">
          <p className="section-label !mb-1.5">{product.category}</p>
          <h3 className="font-serif text-[1.2rem] text-green-deep leading-snug mb-1.5">
            {product.name}
          </h3>
          <p className="text-[12px] text-gray-500 font-light leading-relaxed mb-4 flex-1">
            {product.shortDesc}
          </p>

          <div className="flex items-end justify-between mt-auto">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-[1.4rem] font-semibold text-green-deep">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-sm text-gray-400 line-through font-light">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              aria-label={`Agregar ${product.name} al carrito`}
              className="w-10 h-10 bg-green-deep text-cream flex items-center justify-center
                         transition-all duration-200
                         hover:bg-gold hover:text-green-deep hover:scale-105
                         disabled:bg-gray-200 disabled:cursor-not-allowed"
            >
              <ShoppingBag size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </Link>
    </article>
  )
}
