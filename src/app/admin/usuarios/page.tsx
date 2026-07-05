'use client'

import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { formatPrice } from '@/lib/utils'
import { Search } from 'lucide-react'

interface RawUser {
  uid:         string
  email:       string | null
  displayName: string | null
  role?:       'admin' | 'customer'
  createdAt:   Date
}

interface RawOrder {
  userId:    string
  total:     number
  status:    string
  createdAt: Date
}

interface UserRow {
  uid:            string
  email:          string
  displayName:    string
  registeredAt:   Date
  orderCount:     number
  totalSpent:     number
  lastOrderAt:    Date | null
}

const ALL_STATUSES = [
  'pendiente', 'pagado', 'confirmado', 'enviado',
  'entregado', 'rechazado', 'cancelado', 'reembolsado',
]

const STATUS_LABELS: Record<string, string> = {
  pendiente:   'Pendiente',
  pagado:      'Pagado',
  confirmado:  'Confirmado',
  enviado:     'Enviado',
  entregado:   'Entregado',
  rechazado:   'Rechazado',
  cancelado:   'Cancelado',
  reembolsado: 'Reembolsado',
}

type SortKey = 'total_desc' | 'count_desc'

export default function UsuariosPage() {
  const [users, setUsers]     = useState<RawUser[]>([])
  const [orders, setOrders]   = useState<RawOrder[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch]           = useState('')
  const [activeStatuses, setActiveStatuses] = useState<string[]>(ALL_STATUSES)
  const [sortKey, setSortKey]         = useState<SortKey>('total_desc')

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersSnap, ordersSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'orders')),
        ])

        const usersData = usersSnap.docs.map(d => ({
          uid:         d.id,
          email:       d.data().email ?? null,
          displayName: d.data().displayName ?? null,
          role:        d.data().role,
          createdAt:   d.data().createdAt?.toDate?.() ?? new Date(),
        })) as RawUser[]

        const ordersData = ordersSnap.docs.map(d => ({
          userId:    d.data().userId,
          total:     d.data().total ?? 0,
          status:    d.data().status ?? 'pendiente',
          createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
        })) as RawOrder[]

        setUsers(usersData)
        setOrders(ordersData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  function toggleStatus(status: string) {
    setActiveStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    )
  }

  // Cruce de usuarios + órdenes, recalculado cuando cambian los filtros de estado
  const rows: UserRow[] = useMemo(() => {
    const customers = users.filter(u => u.role !== 'admin')

    return customers.map(user => {
      const userOrders = orders.filter(
        o => o.userId === user.uid && activeStatuses.includes(o.status)
      )

      const totalSpent  = userOrders.reduce((sum, o) => sum + o.total, 0)
      const lastOrderAt = userOrders.length > 0
        ? new Date(Math.max(...userOrders.map(o => o.createdAt.getTime())))
        : null

      return {
        uid:          user.uid,
        email:        user.email ?? '—',
        displayName:  user.displayName ?? 'Sin nombre',
        registeredAt: user.createdAt,
        orderCount:   userOrders.length,
        totalSpent,
        lastOrderAt,
      }
    })
  }, [users, orders, activeStatuses])

  // Búsqueda + orden
  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase()
    let result = rows

    if (term) {
      result = result.filter(r =>
        r.displayName.toLowerCase().includes(term) ||
        r.email.toLowerCase().includes(term)
      )
    }

    return [...result].sort((a, b) =>
      sortKey === 'total_desc'
        ? b.totalSpent - a.totalSpent
        : b.orderCount - a.orderCount
    )
  }, [rows, search, sortKey])

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] tracking-[0.2em] uppercase text-green-olive font-light mb-1">
          Panel de administración
        </p>
        <h1 className="font-serif text-3xl text-green-deep font-light">Usuarios</h1>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-cream-warm bg-white pl-9 pr-3 py-2 text-sm
                       focus:outline-none focus:border-orange transition-colors"
          />
        </div>

        <select
          value={sortKey}
          onChange={e => setSortKey(e.target.value as SortKey)}
          className="border border-cream-warm bg-white px-3 py-2 text-sm focus:outline-none"
        >
          <option value="total_desc">Ordenar por total gastado</option>
          <option value="count_desc">Ordenar por cantidad de compras</option>
        </select>
      </div>

      {/* Chips de estado */}
      <div className="flex flex-wrap gap-2 mb-8">
        {ALL_STATUSES.map(status => {
          const active = activeStatuses.includes(status)
          return (
            <button
              key={status}
              onClick={() => toggleStatus(status)}
              className={`text-[11px] tracking-wide uppercase px-3 py-1.5 rounded-full
                          border transition-colors
                          ${active
                            ? 'bg-green-deep text-cream border-green-deep'
                            : 'bg-white text-gray-400 border-cream-warm hover:border-green-olive'}`}
            >
              {STATUS_LABELS[status]}
            </button>
          )
        })}
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-cream-warm animate-pulse rounded" />
          ))}
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="text-center py-24 text-green-olive font-light">
          No se encontraron usuarios
        </div>
      ) : (
        <div className="bg-white border border-cream-warm">
          <div className="grid grid-cols-[1fr_130px_130px_150px_130px] gap-4 px-5 py-3
                          text-[10px] tracking-[0.15em] uppercase text-green-olive font-medium
                          border-b border-cream-warm">
            <span>Usuario</span>
            <span>Registrado</span>
            <span>Compras</span>
            <span>Total gastado</span>
            <span>Última compra</span>
          </div>

          {filteredRows.map(row => (
            <div
              key={row.uid}
              className="grid grid-cols-[1fr_130px_130px_150px_130px] gap-4 px-5 py-4
                        border-b border-cream-warm last:border-0 hover:bg-cream/30 transition-colors"
            >
              <div>
                <p className="text-sm text-green-deep font-medium truncate">{row.displayName}</p>
                <p className="text-[11px] text-gray-400 font-light truncate">{row.email}</p>
              </div>

              <span className="text-[12px] text-gray-500 font-light self-center">
                {row.registeredAt.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>

              <span className="text-sm text-green-deep font-medium self-center">
                {row.orderCount}
              </span>

              <span className="font-serif text-base font-semibold text-green-deep self-center">
                {formatPrice(row.totalSpent)}
              </span>

              <span className="text-[12px] text-gray-500 font-light self-center">
                {row.lastOrderAt
                  ? row.lastOrderAt.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
                  : '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}