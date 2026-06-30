'use client'

import Link                          from 'next/link'
import { useEffect, useState }       from 'react'
import { collection, getDocs }       from 'firebase/firestore'
import { db }                        from '@/lib/firebase'
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
        const snap = await getDocs(collection(db, 'products'))
        const cats = new Set<ProductCategory>()
        snap.docs.forEach(d => {
          const cat = d.data().category as ProductCategory
          if (cat) cats.add(cat)
        })
        setActiveCategories(Array.from(cats))
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