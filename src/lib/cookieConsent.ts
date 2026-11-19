// Preferencia de cookies del visitante, guardada en localStorage.
// 'accepted' habilita Google Analytics; 'rejected' deja solo las cookies esenciales.
export type ConsentValue = 'accepted' | 'rejected'

const STORAGE_KEY = 'calixto-cookie-consent'
const CHANGE_EVENT = 'calixto-consent-change'

export function getConsent(): ConsentValue | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'accepted' || value === 'rejected' ? value : null
  } catch {
    return null
  }
}

export function setConsent(value: ConsentValue): void {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // Navegación privada o storage bloqueado: la elección vale solo para esta visita
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: value }))
}

// Vuelve a mostrar el banner (link "Configurar cookies" del footer)
export function resetConsent(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: null }))
}

export function subscribeConsent(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}
