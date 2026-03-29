'use client'

import { useState }                from 'react'
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'
import { useCartStore }            from '@/store/cartStore'
import { useAuthStore }            from '@/store/authStore'
import { formatPrice, remainingForFreeShipping } from '@/lib/utils'
import toast                       from 'react-hot-toast'
import type { ShippingAddress, CartItem } from '@/types'

initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY!, {
  locale: 'es-AR',
})

const EMPTY_ADDRESS: ShippingAddress = {
  fullName: '', address: '', city: '',
  province: '', zipCode: '', phone: '',
}

const FIELDS = [
  { name: 'fullName', label: 'Nombre completo', type: 'text' },
  { name: 'address',  label: 'Dirección',        type: 'text' },
  { name: 'city',     label: 'Ciudad',            type: 'text' },
  { name: 'province', label: 'Provincia',         type: 'text' },
  { name: 'zipCode',  label: 'Código postal',     type: 'text' },
  { name: 'phone',    label: 'Teléfono',          type: 'tel'  },
]

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore()
  const { user }                    = useAuthStore()

  const [address,      setAddress]      = useState<ShippingAddress>(EMPTY_ADDRESS)
  const [preferenceId, setPreferenceId] = useState<string | null>(null)
  const [loading,      setLoading]      = useState(false)
  const [step,         setStep]         = useState<'form' | 'payment'>('form')

  // ── Snapshot del pedido (se guarda antes de limpiar el carrito) ──
  const [orderItems, setOrderItems] = useState<CartItem[]>([])
  const [orderTotal, setOrderTotal] = useState(0)

  const cartTotal = total()
  const shipping  = remainingForFreeShipping(cartTotal) === 0 ? 0 : 1500

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAddress(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/crear-preferencia', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingAddress: address,
          total:           cartTotal + shipping,
          userId:          user?.uid ?? 'guest',
        }),
      })

      if (!res.ok) throw new Error('Error al procesar el pedido')

      const { preferenceId: prefId } = await res.json()

      // Guardá snapshot ANTES de limpiar el carrito
      setOrderItems([...items])
      setOrderTotal(cartTotal + shipping)

      setPreferenceId(prefId)
      setStep('payment')
      clearCart()

    } catch (err) {
      console.error(err)
      toast.error('Hubo un error. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // Items a mostrar: snapshot si ya pagamos, carrito si todavía no
  const displayItems = step === 'payment' ? orderItems : items
  const displayTotal = step === 'payment' ? orderTotal : cartTotal + shipping

  if (items.length === 0 && step === 'form') {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif text-2xl text-green-olive mb-6">Tu carrito está vacío</p>
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
          {step === 'form'
            ? <>Datos de <em className="italic text-green-olive">envío</em></>
            : <>Elegí cómo <em className="italic text-green-olive">pagar</em></>
          }
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16 items-start">

          {/* ── Formulario / Botón MP ── */}
          <div>
            {step === 'form' ? (
              <form onSubmit={handleConfirm} className="space-y-5">
                {FIELDS.map(field => (
                  <div key={field.name}>
                    <label className="block text-[11px] tracking-[0.15em] uppercase
                                      text-green-olive mb-1.5 font-light">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      required
                      value={(address as unknown as Record<string, string>)[field.name]}
                      onChange={handleChange}
                      className="w-full border border-cream-warm bg-white px-4 py-3
                                 text-sm text-green-deep font-light
                                 focus:outline-none focus:border-orange transition-colors"
                    />
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Procesando…' : 'Continuar al pago →'}
                </button>
              </form>

            ) : (
              <div>
                <p className="text-sm text-gray-500 font-light mb-6 leading-relaxed">
                  Tu orden fue registrada. Hacé click en el botón para completar
                  el pago con Mercado Pago.
                </p>

                {preferenceId && (
                  <Wallet initialization={{ preferenceId }} />
                )}

                <button
                  onClick={() => setStep('form')}
                  className="btn-ghost mt-6 pl-0"
                >
                  ← Volver a datos de envío
                </button>
              </div>
            )}
          </div>

          {/* ── Resumen ── */}
          <aside className="bg-cream p-8 sticky top-24">
            <h2 className="font-serif text-xl font-light text-green-deep mb-6
                           pb-4 border-b border-cream-warm">
              Resumen
            </h2>

            <ul className="space-y-4 mb-6">
              {displayItems.map(({ product, quantity }) => (
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

            <div className="border-t border-cream-warm pt-5 space-y-2.5">
              <div className="flex justify-between text-[12px] text-gray-400 font-light">
                <span>Envío</span>
                <span>
                  {shipping === 0 ? '🎉 Gratis' : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] tracking-[0.1em] uppercase text-green-olive">
                  Total
                </span>
                <span className="font-serif text-2xl font-semibold text-green-deep">
                  {formatPrice(displayTotal)}
                </span>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  )
}