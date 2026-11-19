'use client'

import { resetConsent } from '@/lib/cookieConsent'

export default function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={resetConsent} className={className}>
      Configurar cookies
    </button>
  )
}
