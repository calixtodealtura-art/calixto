'use client'

import { useState }       from 'react'
import { useRouter }      from 'next/navigation'
import { useCartStore }   from '@/store/cartStore'
import { useAuthStore }   from '@/store/authStore'
import { createOrder }    from '@/lib/firestore'
import { formatPrice, remainingForFreeShipping } from '@/lib/utils'
import toast              from 'react-hot-toast'
import type { ShippingAddress } from '@/types'

const EMPTY_ADDRESS: ShippingAddress = {
  fullName: '', address: '', city: '',
  province: '', zipCode: '', phone: '',
}

export default function CheckoutPage() {
  const router   = useRouter()
  const { items, total, clearCart } = useCartStore()
  const { user } = useAuthStore()

  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS)
  const [loading, setLoading] = useState(false)

  const cartTotal = total()
  const remaining = remainingForFreeShipping(cartTotal)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setAddress(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) { toast.error('Iniciá sesión para continuar'); return }
    if (items.length === 0) { toast.error('Tu carrito está vacío'); return }

    setLoading(true)
    try {
      const orderId = await createOrder({
        userId: user.uid,
        items: items.map(i => ({
          productId:   i.product.id,
          productName: i.product.name,
          price:       i.product.price,
          quantity:    i.quantity,
          image:       i.product.images?.[0] ?? '',
        })),
        shippingAddress: address,
        total: cartTotal,
        status: 'pendiente',
      })

      clearCart()
      toast.success('¡Pedido realizado con éxito!')
      router.push(`/orden-confirmada?id=${orderId}`)
    } catch {
      toast.error('Error al procesar el pedido. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif text-2xl text-green-olive mb-4">Tu carrito está vacío</p>
          <a href="/productos" className="btn-primary">Ver productos</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ivory">
      <div className="max-w-screen-lg mx-auto px-6 md:px-12 py-16">
        <p className="section-label">Finalizar compra</p>
        <h1 className="section-title mb-12">
          Datos de <em className="italic text-green-olive">envío</em>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-16 items-start">

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { name: 'fullName', label: 'Nombre completo', type: 'text', required: true },
              { name: 'address',  label: 'Dirección',       type: 'text', required: true },
              { name: 'city',     label: 'Ciudad',          type: 'text', required: true },
              { name: 'province', label: 'Provincia',       type: 'text', required: true },
              { name: 'zipCode',  label: 'Código postal',   type: 'text', required: true },
              { name: 'phone',    label: 'Teléfono',        type: 'tel',  required: true },
            ].map(field => (
              <div key={field.name}>
                <label className="block text-[11px] tracking-[0.15em] uppercase text-green-olive mb-1.5 font-light">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  required={field.required}
                  value={(address as unknown as Record<string, string>)[field.name]}
                  onChange={handleChange}
                  className="w-full border border-cream-warm bg-white px-4 py-3
                             text-sm text-green-deep font-light
                             focus:outline-none focus:border-gold transition-colors"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Procesando…' : 'Confirmar pedido'}
            </button>
          </form>

          {/* Order summary */}
          <aside className="bg-cream p-8 sticky top-24">
            <h2 className="font-serif text-xl font-light text-green-deep mb-6 pb-4 border-b border-cream-warm">
              Resumen del pedido
            </h2>

            <ul className="space-y-4 mb-6">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex justify-between items-start gap-3">
                  <div>
                    <p className="font-serif text-sm text-green-deep">{product.name}</p>
                    <p className="text-[11px] text-gray-400 font-light">x{quantity}</p>
                  </div>
                  <span className="font-serif text-sm font-semibold text-green-deep whitespace-nowrap">
                    {formatPrice(product.price * quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t border-cream-warm pt-5 space-y-2">
              <div className="flex justify-between text-[12px] text-gray-400 font-light">
                <span>Envío</span>
                <span>{remaining === 0 ? 'Gratis 🎉' : formatPrice(1500)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[11px] tracking-[0.1em] uppercase text-green-olive">Total</span>
                <span className="font-serif text-xl font-semibold text-green-deep">
                  {formatPrice(cartTotal + (remaining === 0 ? 0 : 1500))}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
