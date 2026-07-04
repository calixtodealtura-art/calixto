'use client'

import { useEffect } from 'react'
import { onAuthChange, getUserProfile } from '@/lib/auth'
import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const { user, role, loading, setUser, setRole, setLoading } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthChange(async firebaseUser => {
      setUser(firebaseUser)

      if (!firebaseUser) {
        setRole(null)
        setLoading(false)
        return
      }

      try {
        const profile = await getUserProfile(firebaseUser.uid)
        setRole(profile?.role === 'admin' ? 'admin' : 'customer')
      } catch {
        setRole('customer') // fallback seguro: nunca asumir admin si falla la consulta
      } finally {
        setLoading(false)
      }
    })
    return unsubscribe
  }, [setUser, setRole, setLoading])

  return { user, role, loading }
}