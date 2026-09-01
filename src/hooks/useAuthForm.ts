'use client'

import { useState } from 'react'
import { loginWithEmail, registerWithEmail, loginWithGoogle } from '@/lib/auth'
import toast from 'react-hot-toast'
import type { User } from 'firebase/auth'

function mapAuthError(err: unknown): string {
  const code = (err as { code?: string } | null)?.code
  return code === 'auth/invalid-credential'     ? 'Email o contraseña incorrectos' :
         code === 'auth/email-already-in-use'   ? 'Ese email ya tiene una cuenta' :
         code === 'auth/weak-password'          ? 'La contraseña debe tener al menos 6 caracteres' :
         'Ocurrió un error. Intentá de nuevo.'
}

interface UseAuthFormOptions {
  onSuccess: (user: User) => void | Promise<void>
}

// Login/registro con email+password o Google, compartido por /cuenta y la
// pantalla post-checkout que ofrece guardar el pedido en una cuenta.
export function useAuthForm({ onSuccess }: UseAuthFormOptions) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)

  async function submitEmail(mode: 'login' | 'register', successMessage: string) {
    setLoading(true)
    try {
      const user = mode === 'login'
        ? await loginWithEmail(email, password)
        : await registerWithEmail(email, password)
      toast.success(successMessage)
      await onSuccess(user)
    } catch (err) {
      toast.error(mapAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  async function submitGoogle(successMessage: string) {
    setLoading(true)
    try {
      const user = await loginWithGoogle()
      toast.success(successMessage)
      await onSuccess(user)
    } catch {
      toast.error('No se pudo iniciar sesión con Google')
    } finally {
      setLoading(false)
    }
  }

  return { email, setEmail, password, setPassword, loading, submitEmail, submitGoogle }
}
