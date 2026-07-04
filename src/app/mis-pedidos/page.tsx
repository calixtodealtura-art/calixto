'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuthStore } from '@/store/authStore'
import { formatPrice } from '@/lib/utils'
import { DELIVERY_METHOD_LABELS } from '@/types'
import type { Order, OrderStatus } from '@/types'

const STATUS_LABELS: Record<string, string> = {
  pendiente:   'Pendiente de pago',
  pagado:      'Pago confirmado',
  confirmado:  'Confirmado',
  enviado:     'Enviado',
  entregado:   'Entregado',
  rechazado:   'Pago rechazado',
  cancelado:   'Cancelado',
  reembolsado: 'Reembolsado',
}

const STATUS_STYLES: Record<string, string> = {
  pendiente:   'bg-yellow-100 text-yellow-800',
  pagado:      'bg-green-100 text-green-800',
  confirmado:  'bg-blue-100 text-blue-800',
  enviado:     'bg-purple-100 text-purple-800',
  entregado:   'bg-gray-100 text-gray-700',
  rechazado:   'bg-red-100 text-red-800',
  cancelado:   'bg-red-100 text-red-800',
  reembolsado: 'bg-orange-100 text-orange-800',
}

export default function MisPedidosPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuthStore()

  const [orders, setOrders]     = useState<Order[]>([])
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/cuenta')
      return
    }

    async function fetchOrders() {
      try {
        const snap = await getDocs(
          query(
            collection(db, 'orders'),
            where('userId', '==', user!.uid),
            orderBy('createdAt', 'desc')
          )
        )
        const data = snap.docs.map(d => ({
          ...d.data(),
          id:        d.id,
          createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
        })) as Order[]
        setOrders(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-ivory px-6 py-16 max-w-screen-md mx-auto">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-cream-warm animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ivory">
      <div className="max-w-screen-md mx-auto px-6 py-16">
        <p className="section-label">Tu cuenta</p>
        <h1 className="section-title mb-10">Mis pedidos</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-green-olive font-light mb-6">Todavía no hiciste ningún pedido</p>
            <a href="/productos" className="btn-primary">Ver productos</a>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map(order => (
              <div key={order.id} className="bg-white border border-cream-warm">
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-cream/40 transition-colors gap-4"
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                >
                  <div>
                    <p className="text-xs font-mono text-green-deep">
                      #{order.id.slice(0, 12)}…
                    </p>
                    <p className="text-[11px] text-gray-400 font-light mt-0.5">
                      {order.createdAt instanceof Date
                        ? order.createdAt.toLocaleDateString('es-AR', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })
                        : '—'}
                    </p>
                  </div>

                  <span
                    className={`text-[11px] tracking-wide uppercase px-2 py-1 font-medium rounded
                                ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>

                  <span className="font-serif text-base font-semibold text-green-deep whitespace-nowrap">
                    {formatPrice(order.total)}
                  </span>

                  <span className="text-gray-400 text-lg select-none">
                    {expanded === order.id ? '▲' : '▼'}
                  </span>
                </div>

                {expanded === order.id && (
                  <div className="border-t border-cream-warm px-5 py-5 bg-cream/30 space-y-4">
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

                    {order.deliveryMethod && (
                      <p className="text-[11px] text-gray-500 font-light">
                        Entrega: {DELIVERY_METHOD_LABELS[order.deliveryMethod]}
                        {order.shippingPending && ' — el envío se coordina por separado'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}