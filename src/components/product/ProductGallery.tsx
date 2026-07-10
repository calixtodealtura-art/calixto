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
  const hasMultiple = hasImages && images.length > 1

  return (
    <div className={cn(
      'flex flex-col gap-3',
      hasMultiple && 'md:flex-row md:gap-4'
    )}>
      {/* Miniaturas */}
      {hasMultiple && (
        <div
          className="
            flex gap-3 order-first
            overflow-x-auto pb-1
            md:order-none md:flex-col md:overflow-x-visible md:overflow-y-auto
            md:w-20 md:max-h-[500px] md:pb-0
          "
        >
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActiveIndex(i)}
              aria-label={`Ver foto ${i + 1} de ${productName}`}
              aria-current={activeIndex === i}
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

      {/* Imagen principal */}
      <div className="relative aspect-[4/5] bg-cream overflow-hidden flex-1">
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
    </div>
  )
}