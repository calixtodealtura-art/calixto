'use client'

import Link                from 'next/link'
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCartStore }    from '@/store/cartStore'
import { useAuthStore }    from '@/store/authStore'
import { cn }              from '@/lib/utils'
import CalixtIcon          from '@/components/ui/CalixtIcon'

const NAV_LINKS = [
  { label: 'Aceites',    href: '/productos?categoria=aceites'    },
  { label: 'Varietales', href: '/productos?categoria=varietales' },
  { label: 'Acetos',     href: '/productos?categoria=acetos'     },
  { label: 'Aceitunas',  href: '/productos?categoria=aceitunas'  },
  { label: 'Especiales Gourmet',     href: '/productos?categoria=especiales'     },
  { label: 'Nosotros',   href: '/nosotros'                       },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const [cartCount, setCartCount] = useState(0)
  const itemCount = useCartStore(s => s.itemCount())
  useEffect(() => { setCartCount(itemCount) }, [itemCount])

  const openCart = useCartStore(s => s.openCart)
  const { user } = useAuthStore()

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-green-deep text-cream text-[11px] tracking-[0.18em] uppercase text-center py-2.5 px-4 font-light">
        Envío gratis a CABA y GBA · Resto del país a partir de $200.000 
      </div>

      <header className="sticky top-0 z-50 bg-ivory border-b border-cream-warm">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 h-[72px] flex items-center justify-between gap-8">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 shrink-0 group"
            aria-label="Calixto — Inicio"
          >
            <CalixtIcon
              color="#18532c"
              size={68}
              className="transition-transform duration-300 group-hover:scale-105"
            />
            <div className="flex flex-col leading-none">
              <span className="font-serif text-[1.55rem] font-normal text-green-deep tracking-wide">
                Calixto
              </span>
              <span className="text-[9px] tracking-[0.22em] uppercase text-green-olive font-light mt-0.5">
                Sabores de altura
              </span>
            </div>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(link => (
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
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button aria-label="Buscar" className="text-green-deep hover:text-orange transition-colors">
              <Search size={19} strokeWidth={1.5} />
            </button>

            <Link
              href={user ? '/cuenta' : '/login'}
              aria-label="Mi cuenta"
              className="text-green-deep hover:text-orange transition-colors"
            >
              <User size={19} strokeWidth={1.5} />
            </Link>

            <button
              onClick={openCart}
              aria-label="Carrito"
              className="relative text-green-deep hover:text-orange transition-colors"
            >
              <ShoppingBag size={19} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange text-cream
                                 text-[9px] font-semibold w-4 h-4 rounded-full
                                 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              className="md:hidden text-green-deep"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Menú"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={cn(
          'md:hidden overflow-hidden transition-all duration-300 bg-ivory border-t border-cream-warm',
          mobileOpen ? 'max-h-96' : 'max-h-0'
        )}>
          <nav className="flex flex-col px-6 py-4 gap-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-[12px] tracking-[0.12em] uppercase text-green-deep
                           py-3 border-b border-cream-warm last:border-0 font-light
                           hover:text-orange transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </>
  )
}