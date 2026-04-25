'use client'

import Link                        from 'next/link'
import { usePathname, useRouter }  from 'next/navigation'
import { useEffect, useState }     from 'react'
import { signOut }                 from 'firebase/auth'
import { collection, query, where, getCountFromServer } from 'firebase/firestore'
import { auth, db }                from '@/lib/firebase'
import { ShoppingBag, Package, BarChart2, Truck, MessageSquare, LogOut, Package2 } from 'lucide-react'
import { cn }                      from '@/lib/utils'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [unread, setUnread] = useState(0)

  // Contar mensajes sin leer para el badge
  useEffect(() => {
    async function fetchUnread() {
      try {
        const snap = await getCountFromServer(
          query(collection(db, 'contacts'), where('read', '==', false))
        )
        setUnread(snap.data().count)
      } catch {
        // silencioso
      }
    }
    fetchUnread()
  }, [pathname])

  async function handleLogout() {
    await signOut(auth)
    document.cookie = 'calixto-admin-token=; path=/; max-age=0'
    router.push('/admin/login')
  }

  if (pathname === '/admin/login') return <>{children}</>

  const NAV = [
    { href: '/admin/ordenes',   label: 'Órdenes',   icon: ShoppingBag,   badge: null   },
    { href: '/admin/productos', label: 'Productos',  icon: Package,       badge: null   },
    { href: '/admin/combos', label: 'Combos', icon: Package2, badge: null },
    { href: '/admin/stock',     label: 'Stock',      icon: BarChart2,     badge: null   },
    { href: '/admin/mensajes',  label: 'Mensajes',   icon: MessageSquare, badge: unread },
  ]

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex">
      <aside className="w-56 bg-green-deep flex flex-col shrink-0">
        <div className="px-6 py-6 border-b border-green-mid">
          <p className="font-serif text-xl font-semibold text-cream tracking-widest">
            CALIXTO
          </p>
          <p className="text-[9px] tracking-[0.2em] uppercase text-orange mt-0.5 font-light">
            Admin
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(item => {
            const Icon   = item.icon
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 text-[12px] tracking-wide transition-all',
                  active
                    ? 'bg-green-mid text-orange'
                    : 'text-cream/60 hover:text-cream hover:bg-green-mid/50'
                )}
              >
                <Icon size={15} strokeWidth={1.5} />
                <span className="flex-1">{item.label}</span>
                {/* Badge mensajes sin leer */}
                {item.badge != null && item.badge > 0 && (
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                    style={{ backgroundColor: '#ed832b', color: '#18532c' }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

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

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}