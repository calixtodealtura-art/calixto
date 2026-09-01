'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserProfile, setAdminSessionCookie } from '@/lib/auth'
import { useAuthForm } from '@/hooks/useAuthForm'
import type { User } from 'firebase/auth'

export default function CuentaClient() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')

  // Decide a dónde mandar al usuario según su rol, y setea la cookie admin si corresponde
  async function redirectByRole(user: User) {
    const profile = await getUserProfile(user.uid)

    if (profile?.role === 'admin') {
      await setAdminSessionCookie(user)
      router.push('/admin')
    } else {
      router.push('/mis-pedidos')
    }
  }

  const { email, setEmail, password, setPassword, loading, submitEmail, submitGoogle } =
    useAuthForm({ onSuccess: redirectByRole })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    submitEmail(mode, mode === 'login' ? 'Bienvenido de nuevo' : 'Cuenta creada')
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="section-label text-center">Mi cuenta</p>
        <h1 className="font-serif text-3xl font-light text-green-deep text-center mb-8">
          {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cuenta-email" className="block text-[11px] tracking-[0.15em] uppercase text-green-olive mb-1.5 font-light">
              Email
            </label>
            <input
              id="cuenta-email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-cream-warm bg-white px-4 py-3 text-sm text-green-deep font-light focus:outline-none focus:border-orange transition-colors"
            />
          </div>

          <div>
            <label htmlFor="cuenta-password" className="block text-[11px] tracking-[0.15em] uppercase text-green-olive mb-1.5 font-light">
              Contraseña
            </label>
            <input
              id="cuenta-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-cream-warm bg-white px-4 py-3 text-sm text-green-deep font-light focus:outline-none focus:border-orange transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Un momento…' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-cream-warm" />
          <span className="text-[11px] text-gray-400 font-light">o</span>
          <div className="flex-1 h-px bg-cream-warm" />
        </div>

        <button
          onClick={() => submitGoogle('Bienvenido')}
          disabled={loading}
          className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar con Google
        </button>

        <p className="text-center text-sm text-gray-500 font-light mt-8">
          {mode === 'login' ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}{' '}
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-green-olive hover:text-orange transition-colors underline"
          >
            {mode === 'login' ? 'Creá una' : 'Iniciá sesión'}
          </button>
        </p>
      </div>
    </div>
  )
}
