'use client'

import Link                from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut }         from 'firebase/auth'
import { auth }            from '@/lib/firebase'
import { LayoutDashboard, ShoppingBag, Package, LogOut } from 'lucide-react'
import { cn }              from '@/lib/utils'

const NAV = [
  { href: '/admin/ordenes',   label: 'Órdenes',   icon: ShoppingBag  },
  { href: '/admin/productos', label: 'Productos', icon: Package       },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleLogout() {
    await signOut(auth)
    document.cookie = 'calixto-admin-token=; path=/; max-age=0'
    router.push('/admin/login')
  }

  // No mostrar sidebar en la página de login
  if (pathname === '/admin/login') return <>{children}</>

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex">

      {/* Sidebar */}
      <aside className="w-56 bg-green-deep flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-green-mid">
          <p className="font-serif text-xl font-semibold text-cream tracking-widest">
            CALIXTO
          </p>
          <p className="text-[9px] tracking-[0.2em] uppercase text-gold mt-0.5 font-light">
            Admin
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(item => {
            const Icon    = item.icon
            const active  = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 text-[12px] tracking-wide transition-all',
                  active
                    ? 'bg-green-mid text-gold'
                    : 'text-cream/60 hover:text-cream hover:bg-green-mid/50'
                )}
              >
                <Icon size={15} strokeWidth={1.5} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-green-mid">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full
                       text-[12px] tracking-wide text-cream/50
                       hover:text-cream transition-colors"
          >
            <LogOut size={15} strokeWidth={1.5} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}