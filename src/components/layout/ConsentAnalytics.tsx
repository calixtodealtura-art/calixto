'use client'

import { GoogleAnalytics } from '@next/third-parties/google'
import { useCookieConsent } from '@/hooks/useCookieConsent'

// Carga Google Analytics solo si el visitante aceptó las cookies analíticas
export default function ConsentAnalytics({ gaId }: { gaId: string }) {
  const consent = useCookieConsent()
  if (consent !== 'accepted') return null
  return <GoogleAnalytics gaId={gaId} />
}
