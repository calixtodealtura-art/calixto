'use client'

import Link                          from 'next/link'
import { useEffect, useState }       from 'react'
import { getProductCountByCategory } from '@/lib/firestore'
import type { ProductCategory }      from '@/types'

const ALL_CATEGORIES: { slug: ProductCategory; label: string }[] = [
  { slug: 'aceites',    label: 'Aceites'          },
  { slug: 'varietales', label: 'Varietales'        },
  { slug: 'acetos',     label: 'Acetos'            },
  { slug: 'aceitunas',  label: 'Aceitunas'         },
  { slug: 'especiales', label: 'Especiales Gourmet'},
]

const STATIC_LINKS = [
  { label: 'Nosotros', href: '/nosotros' },
]

export default function DynamicNav() {
  const [activeCategories, setActiveCategories] = useState<ProductCategory[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function fetchCategories() {
      try {
        // Un conteo por categoría (aggregation query, no descarga documentos)
        // en vez de traer la colección products entera solo para saber
        // qué categorías tienen al menos un producto.
        const counts = await Promise.all(
          ALL_CATEGORIES.map(cat => getProductCountByCategory(cat.slug))
        )
        const cats = ALL_CATEGORIES
          .filter((_, i) => counts[i] > 0)
          .map(c => c.slug)
        setActiveCategories(cats)
      } catch {
        // Si falla, mostramos todas las categorías como fallback
        setActiveCategories(ALL_CATEGORIES.map(c => c.slug))
      } finally {
        setLoaded(true)
      }
    }
    fetchCategories()
  }, [])

  const visibleCategories = ALL_CATEGORIES.filter(c =>
    activeCategories.includes(c.slug)
  )

  return (
    <nav className="hidden md:flex items-center gap-7">
      {/* Skeleton mientras carga */}
      {!loaded ? (
        Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-3 w-16 bg-cream-warm animate-pulse rounded"
          />
        ))
      ) : (
        <>
          {visibleCategories.map(cat => (
            <Link
              key={cat.slug}
              href={`/productos?categoria=${cat.slug}`}
              className="text-[11px] tracking-[0.12em] uppercase text-green-deep font-normal
                         relative group transition-colors hover:text-orange"
            >
              {cat.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-orange
                               transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
          {STATIC_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[11px] tracking-[0.12em] uppercase text-green-deep font-normal
                         relative group transition-colors hover:text-orange"
            >
              {link.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-orange
                               transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </>
      )}
    </nav>
  )
}