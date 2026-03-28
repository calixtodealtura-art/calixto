'use client'

import { useEffect, useState }   from 'react'
import { collection, getDocs,
         orderBy, query, doc,
         updateDoc }             from 'firebase/firestore'
import { db }                    from '@/lib/firebase'
import { formatPrice }           from '@/lib/utils'
import toast                     from 'react-hot-toast'
import type { Order, OrderStatus } from '@/types'

const STATUS_STYLES: Record<string, string> = {
  pendiente:    'bg-yellow-100 text-yellow-800',
  pagado:       'bg-green-100 text-green-800',
  confirmado:   'bg-blue-100 text-blue-800',
  enviado:      'bg-purple-100 text-purple-800',
  entregado:    'bg-gray-100 text-gray-700',
  rechazado:    'bg-red-100 text-red-800',
  cancelado:    'bg-red-100 text-red-800',
  reembolsado:  'bg-orange-100 text-orange-800',
}

const STATUS_OPTIONS: OrderStatus[] = [
  'pendiente', 'confirmado', 'enviado', 'entregado'
]

export default function OrdenesPage() {
  const [orders,  setOrders]  = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrders() {
      try {
        const snap = await getDocs(
          query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
        )
        const data = snap.docs.map(d => ({
          ...d.data(),
          id:        d.id,
          createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
        })) as Order[]
        setOrders(data)
      } catch (err) {
        console.error(err)
        toast.error('Error cargando órdenes')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus })
      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
      )
      toast.success('Estado actualizado')
    } catch {
      toast.error('No se pudo actualizar')
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] tracking-[0.2em] uppercase text-green-olive font-light mb-1">
          Panel de administración
        </p>
        <h1 className="font-serif text-3xl text-green-deep font-light">Órdenes</h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-cream-warm animate-pulse rounded" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 text-green-olive font-light">
          No hay órdenes todavía
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map(order => (
            <div key={order.id} className="bg-white border border-cream-warm">

              {/* Row */}
              <div
                className="grid grid-cols-[1fr_160px_120px_160px_40px] items-center
                           px-5 py-4 cursor-pointer hover:bg-cream/40 transition-colors gap-4"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                {/* ID + fecha */}
                <div>
                  <p className="text-xs font-mono text-green-deep truncate">
                    #{order.id.slice(0, 12)}…
                  </p>
                  <p className="text-[11px] text-gray-400 font-light mt-0.5">
                    {order.createdAt instanceof Date
                      ? order.createdAt.toLocaleDateString('es-AR', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })
                      : '—'}
                  </p>
                </div>

                {/* Cliente */}
                <div className="text-sm text-green-deep font-light truncate">
                  {order.shippingAddress?.fullName ?? '—'}
                </div>

                {/* Total */}
                <div className="font-serif text-base font-semibold text-green-deep">
                  {formatPrice(order.total)}
                </div>

                {/* Estado */}
                <div onClick={e => e.stopPropagation()}>
                  <select
                    value={order.status}
                    onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                    className={`text-[11px] tracking-wide uppercase px-2 py-1 border-0
                                font-medium rounded cursor-pointer focus:outline-none
                                ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Expand */}
                <div className="text-gray-400 text-lg select-none text-center">
                  {expanded === order.id ? '▲' : '▼'}
                </div>
              </div>

              {/* Detalle expandido */}
              {expanded === order.id && (
                <div className="border-t border-cream-warm px-5 py-5
                                grid grid-cols-1 md:grid-cols-2 gap-6 bg-cream/30">

                  {/* Items */}
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-green-olive mb-3 font-medium">
                      Productos
                    </p>
                    <ul className="space-y-2">
                      {order.items?.map((item, i) => (
                        <li key={i} className="flex justify-between text-sm">
                          <span className="text-green-deep font-light">
                            {item.productName} <span className="text-gray-400">x{item.quantity}</span>
                          </span>
                          <span className="font-serif font-semibold text-green-deep">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Datos de envío */}
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-green-olive mb-3 font-medium">
                      Datos de envío
                    </p>
                    {order.shippingAddress && (
                      <address className="not-italic text-sm text-green-deep font-light space-y-1">
                        <p className="font-medium">{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.address}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.zipCode}</p>
                        <p>{order.shippingAddress.phone}</p>
                      </address>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}