import type { Metadata } from 'next'
import { Suspense } from 'react'
import OrdenContent from './OrdenContent'

export const metadata: Metadata = {
  title: 'Orden confirmada | Calixto',
  robots: {
    index:  false,
    follow: false,
  },
}

export default function OrdenConfirmadaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <p className="font-serif text-xl text-green-olive">Cargando...</p>
      </div>
    }>
      <OrdenContent />
    </Suspense>
  )
}