import { cookies } from 'next/headers'
import { getAdminAuth, getAdminDb } from '@/lib/firebaseAdmin'

// Verifica server-side que la request venga de un usuario con role 'admin'
export async function isRequestFromAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('calixto-admin-token')?.value
  if (!token) return false

  try {
    const decoded = await getAdminAuth().verifyIdToken(token)
    const snap = await getAdminDb().collection('users').doc(decoded.uid).get()
    return snap.exists && snap.data()?.role === 'admin'
  } catch (err) {
    // Sin este log, un Firebase Admin mal configurado en Vercel se ve igual que un token vencido
    console.error('[adminAuth] verificación de admin falló:', err)
    return false
  }
}
