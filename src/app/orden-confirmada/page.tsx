import { Suspense } from 'react'
import Link         from 'next/link'
import OrdenContent from './OrdenContent'

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