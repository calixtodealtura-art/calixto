'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface Props {
  images: string[]
  productName: string
}

export default function ProductGallery({ images, productName }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)

  const hasImages = images && images.length > 0

  return (
    <div>
      {/* Imagen principal */}
      <div className="relative aspect-[4/5] bg-cream overflow-hidden">
        {hasImages ? (
          <Image
            src={images[activeIndex]}
            alt={`${productName} — foto ${activeIndex + 1}`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[12rem]
                          bg-gradient-to-br from-cream to-cream-warm">
            🫒
          </div>
        )}
      </div>

      {/* Miniaturas — solo si hay más de una imagen */}
      {hasImages && images.length > 1 && (
        <div className="flex gap-3 mt-4">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActiveIndex(i)}
              aria-label={`Ver foto ${i + 1} de ${productName}`}
              className={cn(
                'relative w-20 h-20 shrink-0 bg-cream overflow-hidden transition-all',
                activeIndex === i
                  ? 'ring-2 ring-green-deep ring-offset-2 ring-offset-ivory'
                  : 'opacity-60 hover:opacity-100'
              )}
            >
              <Image
                src={src}
                alt={`${productName} — miniatura ${i + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}