// Pide al servidor que regenere las páginas públicas tras un cambio en el admin.
// Si falla no bloquea nada: las páginas igual se actualizan solas en 1–5 minutos.
export async function refreshStorefront(): Promise<void> {
  try {
    await fetch('/api/revalidate', { method: 'POST' })
  } catch (err) {
    console.warn('[refreshStorefront] no se pudo revalidar la tienda:', err)
  }
}
