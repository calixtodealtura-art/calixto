import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Página no encontrada | Calixto — Sabores de Altura',
  robots: { index: false },
}

export default function NotFound() {
  return (
    <div className="bg-ivory">
      <section className="max-w-screen-xl mx-auto px-8 md:px-20 pt-40 pb-28 text-center">
        <p className="section-label">Error 404</p>
        <h1
          className="font-serif font-light text-green-deep leading-[1.05] mb-6"
          style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}
        >
          No encontramos <em className="not-italic text-orange">esta página</em>
        </h1>
        <p className="text-gray-600 font-light leading-[1.85] text-sm max-w-md mx-auto mb-10">
          Puede que el producto ya no esté disponible o que el enlace haya cambiado.
          Te invitamos a recorrer la tienda.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/productos"
            className="px-7 py-3 text-[11px] tracking-[0.18em] uppercase
                       bg-green-deep text-cream hover:bg-green-olive transition-colors duration-200"
          >
            Ver productos
          </Link>
          <Link
            href="/"
            className="px-7 py-3 text-[11px] tracking-[0.18em] uppercase
                       border border-green-deep/30 text-green-deep hover:border-green-deep
                       transition-colors duration-200"
          >
            Ir al inicio
          </Link>
        </div>
      </section>
    </div>
  )
}
