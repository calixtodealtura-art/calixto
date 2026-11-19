'use client'

import Link from 'next/link'
import { setConsent } from '@/lib/cookieConsent'
import { useCookieConsent } from '@/hooks/useCookieConsent'

export default function CookieBanner() {
  const consent = useCookieConsent()
  if (consent !== null) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-orange/40"
      style={{ backgroundColor: '#1c1c1c' }}
    >
      <div className="max-w-screen-xl mx-auto px-6 md:px-20 py-5
                      flex flex-col md:flex-row md:items-center gap-4 md:gap-10">
        <p className="text-[13px] text-cream/70 font-light leading-relaxed flex-1">
          Usamos cookies esenciales para que el sitio funcione (sesión y carrito) y, si nos das
          permiso, cookies de Google Analytics para entender cómo se usa la tienda y mejorarla.{' '}
          <Link href="/privacidad#cookies" className="text-orange hover:text-orange-light underline underline-offset-2">
            Más información
          </Link>
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setConsent('rejected')}
            className="px-5 py-2.5 text-[11px] tracking-[0.18em] uppercase
                       text-cream/70 border border-cream/25 hover:border-cream/60 hover:text-cream
                       transition-colors duration-200"
          >
            Solo esenciales
          </button>
          <button
            type="button"
            onClick={() => setConsent('accepted')}
            className="px-5 py-2.5 text-[11px] tracking-[0.18em] uppercase
                       bg-orange text-white hover:bg-orange-dark transition-colors duration-200"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  )
}
