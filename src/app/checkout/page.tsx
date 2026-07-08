'use client'

import { useState }                from 'react'
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'
import { useCartStore }            from '@/store/cartStore'
import { useAuthStore }            from '@/store/authStore'
import { useShippingConfig }       from '@/lib/hooks/useShippingConfig'
import { formatPrice, remainingForFreeShipping } from '@/lib/utils'
import toast                       from 'react-hot-toast'
import { Store, Truck, MapPin }    from 'lucide-react'
import type { ShippingAddress, PickupContact, CartItem, DeliveryMethod } from '@/types'
import { DELIVERY_METHOD_LABELS }  from '@/types'

initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY!, {
  locale: 'es-AR',
})

const EMPTY_ADDRESS: ShippingAddress = {
  fullName: '', address: '', city: '',
  province: '', zipCode: '', phone: '',
}

const EMPTY_PICKUP: PickupContact = {
  fullName: '', phone: '',
}

const ADDRESS_FIELDS = [
  { name: 'fullName', label: 'Nombre completo', type: 'text' },
  { name: 'address',  label: 'Dirección',        type: 'text' },
  { name: 'city',     label: 'Ciudad',            type: 'text' },
  { name: 'province', label: 'Provincia',         type: 'text' },
  { name: 'zipCode',  label: 'Código postal',     type: 'text' },
  { name: 'phone',    label: 'Teléfono',          type: 'tel'  },
]

const PICKUP_FIELDS = [
  { name: 'fullName', label: 'Nombre completo', type: 'text' },
  { name: 'phone',    label: 'Teléfono',          type: 'tel'  },
]

type Step = 'method' | 'form' | 'payment'

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore()
  const { user }                    = useAuthStore()
  const {
    threshold, shippingCost,
    pickupAddress, pickupHours,
    interiorContactMessage, interiorContactLink,
  } = useShippingConfig()

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod | null>(null)
  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS)
  const [pickup,  setPickup]  = useState<PickupContact>(EMPTY_PICKUP)

  const [preferenceId, setPreferenceId] = useState<string | null>(null)
  const [loading,      setLoading]      = useState(false)
  const [step,         setStep]         = useState<Step>('method')

  // ── Snapshot del pedido (se guarda antes de limpiar el carrito) ──
  const [orderItems, setOrderItems]       = useState<CartItem[]>([])
  const [orderTotal, setOrderTotal]       = useState(0)
  const [orderShipping, setOrderShipping] = useState(0)
  const [orderMethod, setOrderMethod]     = useState<DeliveryMethod | null>(null)

  const cartTotal   = total()
  const configReady = threshold !== null && shippingCost !== null

  // Costo de envío según el método elegido
  const shipping =
    deliveryMethod === 'envio_caba_gba' && configReady
      ? (remainingForFreeShipping(cartTotal, threshold!) === 0 ? 0 : shippingCost!)
      : 0 // retiro e interior no se cobran online

  const isInterior = deliveryMethod === 'envio_interior'
  const isPickup    = deliveryMethod === 'retiro'
  const needsAddressForm = deliveryMethod === 'envio_caba_gba' || deliveryMethod === 'envio_interior'

  function handleAddressChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAddress(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handlePickupChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPickup(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSelectMethod(method: DeliveryMethod) {
    setDeliveryMethod(method)
    setStep('form')
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault()

    if (!deliveryMethod) return

    if (deliveryMethod === 'envio_caba_gba' && !configReady) {
      toast.error('Un momento, todavía estamos calculando el envío…')
      return
    }

    setLoading(true)

    try {
      const finalTotal = cartTotal + shipping

      const res = await fetch('/api/crear-preferencia', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          deliveryMethod,
          shippingAddress: needsAddressForm ? address : undefined,
          pickupContact:   isPickup ? pickup : undefined,
          shippingCost:    shipping,
          shippingPending: isInterior,
          total:           finalTotal,
          userId:          user?.uid ?? 'guest',
        }),
      })

      if (!res.ok) throw new Error('Error al procesar el pedido')

      const { preferenceId: prefId } = await res.json()

      // Guardá snapshot ANTES de limpiar el carrito
      setOrderItems([...items])
      setOrderTotal(finalTotal)
      setOrderShipping(shipping)
      setOrderMethod(deliveryMethod)

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

  // Items/valores a mostrar: snapshot si ya pagamos, carrito si todavía no
  const displayItems    = step === 'payment' ? orderItems : items
  const displayTotal    = step === 'payment' ? orderTotal : cartTotal + shipping
  const displayShipping = step === 'payment' ? orderShipping : shipping
  const displayMethod   = step === 'payment' ? orderMethod : deliveryMethod

  if (items.length === 0 && step !== 'payment') {
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
          {step === 'method'  && <>¿Cómo querés <em className="italic text-green-olive">recibirlo</em>?</>}
          {step === 'form'    && <>Datos de <em className="italic text-green-olive">entrega</em></>}
          {step === 'payment' && <>Elegí cómo <em className="italic text-green-olive">pagar</em></>}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16 items-start">

          {/* ── Columna principal ── */}
          <div>

            {/* Paso 0: método de entrega */}
            {step === 'method' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => handleSelectMethod('retiro')}
                  className="border border-cream-warm bg-white p-6 text-left hover:border-orange transition-colors flex flex-col gap-3"
                >
                  <Store size={22} strokeWidth={1.5} className="text-green-deep" />
                  <span className="font-serif text-base text-green-deep">Retiro en el local</span>
                  <span className="text-[11px] text-gray-400 font-light">Sin costo</span>
                </button>

                <button
                  onClick={() => handleSelectMethod('envio_caba_gba')}
                  className="border border-cream-warm bg-white p-6 text-left hover:border-orange transition-colors flex flex-col gap-3"
                >
                  <Truck size={22} strokeWidth={1.5} className="text-green-deep" />
                  <span className="font-serif text-base text-green-deep">Envío a CABA / GBA</span>
                  <span className="text-[11px] text-gray-400 font-light">Costo calculado automáticamente</span>
                </button>

                <button
                  onClick={() => handleSelectMethod('envio_interior')}
                  className="border border-cream-warm bg-white p-6 text-left hover:border-orange transition-colors flex flex-col gap-3"
                >
                  <MapPin size={22} strokeWidth={1.5} className="text-green-deep" />
                  <span className="font-serif text-base text-green-deep">Envío al interior</span>
                  <span className="text-[11px] text-gray-400 font-light">A coordinar</span>
                </button>
              </div>
            )}

            {/* Paso 1: formulario */}
            {step === 'form' && deliveryMethod && (
              <form onSubmit={handleConfirm} className="space-y-5">

                <button
                  type="button"
                  onClick={() => setStep('method')}
                  className="text-[11px] tracking-[0.1em] uppercase text-green-olive hover:text-orange transition-colors mb-2"
                >
                  ← {DELIVERY_METHOD_LABELS[deliveryMethod]} · cambiar
                </button>

                {isPickup && (pickupAddress || pickupHours) && (
                  <div className="bg-cream p-4 text-sm text-green-deep font-light space-y-1">
                    {pickupAddress && (
                      <p><strong className="font-medium">Dirección:</strong> {pickupAddress}</p>
                    )}
                    {pickupHours && (
                      <p><strong className="font-medium">Horarios:</strong> {pickupHours}</p>
                    )}
                  </div>
                )}

                {isInterior && (
                  <div className="bg-cream p-4 text-sm text-green-deep font-light">
                    <p className="mb-2">{interiorContactMessage}</p>
                    {interiorContactLink ? (
                      <a
                        href={interiorContactLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange underline"
                      >
                        Contactar
                      </a>
                    ) : null}
                  </div>
                )}

                {isPickup
                  ? PICKUP_FIELDS.map(field => (
                      <div key={field.name}>
                        <label className="block text-[11px] tracking-[0.15em] uppercase text-green-olive mb-1.5 font-light">
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          name={field.name}
                          required
                          value={(pickup as unknown as Record<string, string>)[field.name]}
                          onChange={handlePickupChange}
                          className="w-full border border-cream-warm bg-white px-4 py-3 text-sm text-green-deep font-light focus:outline-none focus:border-orange transition-colors"
                        />
                      </div>
                    ))
                  : ADDRESS_FIELDS.map(field => (
                      <div key={field.name}>
                        <label className="block text-[11px] tracking-[0.15em] uppercase text-green-olive mb-1.5 font-light">
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          name={field.name}
                          required
                          value={(address as unknown as Record<string, string>)[field.name]}
                          onChange={handleAddressChange}
                          className="w-full border border-cream-warm bg-white px-4 py-3 text-sm text-green-deep font-light focus:outline-none focus:border-orange transition-colors"
                        />
                      </div>
                    ))
                }

                <button
                  type="submit"
                  disabled={loading || (deliveryMethod === 'envio_caba_gba' && !configReady)}
                  className="btn-primary w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deliveryMethod === 'envio_caba_gba' && !configReady
                    ? 'Calculando envío…'
                    : loading ? 'Procesando…' : 'Continuar al pago →'}
                </button>
              </form>
            )}

            {/* Paso 2: pago */}
            {step === 'payment' && (
              <div>
                <p className="text-sm text-gray-500 font-light mb-6 leading-relaxed">
                  Tu orden fue registrada. Hacé click en el botón para completar el pago con Mercado Pago.
                  {isInterior ? ' El costo de envío se coordina y cobra por separado.' : ''}
                </p>

                {preferenceId && (
                  <Wallet initialization={{ preferenceId }} />
                )}
              </div>
            )}
          </div>

          {/* ── Resumen ── */}
          <aside className="bg-cream p-8 sticky top-24">
            <h2 className="font-serif text-xl font-light text-green-deep mb-6 pb-4 border-b border-cream-warm">
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
              {displayMethod && (
                <div className="flex justify-between text-[12px] text-gray-400 font-light">
                  <span>Entrega</span>
                  <span>{DELIVERY_METHOD_LABELS[displayMethod]}</span>
                </div>
              )}

              <div className="flex justify-between text-[12px] text-gray-400 font-light">
                <span>Envío</span>
                <span>
                  {displayMethod === 'envio_interior'
                    ? 'A coordinar'
                    : displayMethod === 'retiro'
                    ? '$0'
                    : (step === 'form' && !configReady)
                    ? '—'
                    : displayShipping === 0 ? '🎉 Gratis si sos de CABA o GBA, sino consultar' : formatPrice(displayShipping)}
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