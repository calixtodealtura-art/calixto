import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAdminAuth, getAdminDb } from '@/lib/firebaseAdmin'
import AdminLayoutClient from './AdminLayoutClient'

export const metadata: Metadata = {
  title: 'Admin | Calixto',
  robots: {
    index:  false,
    follow: false,
  },
}

async function isVerifiedAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('calixto-admin-token')?.value
  if (!token) return false

  try {
    const decoded = await getAdminAuth().verifyIdToken(token)
    const snap = await getAdminDb().collection('users').doc(decoded.uid).get()
    return snap.exists && snap.data()?.role === 'admin'
  } catch (err) {
    console.error('Verificación de admin falló:', err)
    return false
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''

  if (!pathname.startsWith('/admin/login')) {
    const ok = await isVerifiedAdmin()
    if (!ok) redirect('/admin/login')
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
