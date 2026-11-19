'use client'

import { useSyncExternalStore } from 'react'
import { getConsent, subscribeConsent, type ConsentValue } from '@/lib/cookieConsent'

// undefined = todavía en el servidor / primer render (no mostrar nada)
// null      = el visitante no eligió
export function useCookieConsent(): ConsentValue | null | undefined {
  return useSyncExternalStore(subscribeConsent, getConsent, () => undefined)
}
