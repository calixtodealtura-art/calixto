'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useCartStore } from '@/store/cartStore'

export default function OrdenConfirmadaPage() {

  const params = useSearchParams()
  const status = params.get('status')
  const orderId = params.get('external_reference')

  const clearCart = useCartStore(state => state.clearCart)

  useEffect(() => {
    if (status === 'approved') {
      clearCart()
    }
  }, [status, clearCart])

  const isApproved = status === 'approved'
  const isPending = status === 'pending'

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center">
      <div className="text-center max-w-lg px-8">

        <div className="text-8xl mb-8 animate-float inline-block">
          {isApproved ? '🫒' : '⏳'}
        </div>

        <h1 className="font-serif text-4xl font-light text-green-deep mb-4">
          {isApproved && '¡Pago confirmado!'}
          {isPending && 'Pago pendiente'}
          {!status && '¡Gracias por tu pedido!'}
        </h1>

        <p className="text-gray-500 font-light text-sm leading-relaxed mb-4">
          {isApproved &&
            'Tu pago fue aprobado correctamente. Prepararemos tu pedido y te enviaremos novedades pronto.'}

          {isPending &&
            'Tu pago está pendiente de confirmación. Te avisaremos cuando se acredite.'}

          {!status &&
            'Recibimos tu orden correctamente. Te enviaremos novedades en cuanto confirmemos el pago.'}
        </p>

        {orderId && (
          <p className="text-xs text-gray-400 mb-8">
            Número de orden: <strong>{orderId}</strong>
          </p>
        )}

        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/" className="btn-primary">
            Volver al inicio
          </Link>

          <Link href="/productos" className="btn-secondary">
            Seguir comprando
          </Link>
        </div>

      </div>
    </div>
  )
}
