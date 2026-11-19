'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="bg-ivory">
      <section className="max-w-screen-xl mx-auto px-8 md:px-20 pt-40 pb-28 text-center">
        <p className="section-label">Algo salió mal</p>
        <h1
          className="font-serif font-light text-green-deep leading-[1.05] mb-6"
          style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}
        >
          Tuvimos un <em className="not-italic text-orange">problema</em>
        </h1>
        <p className="text-gray-600 font-light leading-[1.85] text-sm max-w-md mx-auto mb-10">
          No pudimos cargar esta página. Probá de nuevo en unos segundos; si el problema
          sigue, escribinos y lo resolvemos.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="px-7 py-3 text-[11px] tracking-[0.18em] uppercase
                       bg-green-deep text-cream hover:bg-green-olive transition-colors duration-200"
          >
            Reintentar
          </button>
          <Link
            href="/contacto"
            className="px-7 py-3 text-[11px] tracking-[0.18em] uppercase
                       border border-green-deep/30 text-green-deep hover:border-green-deep
                       transition-colors duration-200"
          >
            Contacto
          </Link>
        </div>
      </section>
    </div>
  )
}
