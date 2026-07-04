'use client'

import { useState }        from 'react'
import Link                from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuthStore }    from '@/store/authStore'
import { loginWithEmail, registerWithEmail, loginWithGoogle } from '@/lib/auth'
import { claimGuestOrder } from '@/lib/orders'
import toast                from 'react-hot-toast'

export default function OrdenContent() {
  const params  = useSearchParams()
  const status  = params.get('status')
  const orderId = params.get('orderId')

  const isPending = status === 'pending'

  const { user } = useAuthStore()

  const [mode, setMode]         = useState<'idle' | 'login' | 'register'>('idle')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [saved, setSaved]       = useState(false)

  async function handleClaim(uid: string) {
    if (!orderId) return
    try {
      await claimGuestOrder(orderId, uid)
      setSaved(true)
    } catch {
      // Si la orden ya no era de invitado (o algo cambió), no rompemos la experiencia
      setSaved(true)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const result = mode === 'login'
        ? await loginWithEmail(email, password)
        : await registerWithEmail(email, password)

      await handleClaim(result.uid)
      toast.success('¡Listo! Tu pedido quedó guardado.')
    } catch (err: any) {
      const message =
        err?.code === 'auth/invalid-credential' ? 'Email o contraseña incorrectos' :
        err?.code === 'auth/email-already-in-use' ? 'Ese email ya tiene una cuenta' :
        err?.code === 'auth/weak-password' ? 'La contraseña debe tener al menos 6 caracteres' :
        'Ocurrió un error. Intentá de nuevo.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setLoading(true)
    try {
      const user = await loginWithGoogle()
      await handleClaim(user.uid)
      toast.success('¡Listo! Tu pedido quedó guardado.')
    } catch {
      toast.error('No se pudo iniciar sesión con Google')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center py-16">
      <div className="text-center max-w-lg px-8">
        <div className="text-8xl mb-8 animate-float inline-block">
          {isPending ? '⏳' : '🫒'}
        </div>

        <h1 className="font-serif text-4xl font-light text-green-deep mb-4">
          {isPending ? 'Pago en proceso' : '¡Gracias por tu pedido!'}
        </h1>

        <p className="text-gray-500 font-light text-sm leading-relaxed mb-4">
          {isPending
            ? 'Tu pago está siendo procesado. Te avisaremos cuando se confirme.'
            : 'Recibimos tu orden correctamente. Te enviaremos un correo con el seguimiento en cuanto confirmemos el pago.'
          }
        </p>

        {orderId && (
          <p className="text-xs text-gray-400 font-mono mb-8">
            Número de orden: {orderId}
          </p>
        )}

        {/* ── Guardar pedido en la cuenta ── */}
        {orderId && !user && !saved && (
          <div className="bg-white border border-cream-warm p-6 mb-8 text-left">
            {mode === 'idle' ? (
              <>
                <p className="text-sm text-green-deep font-light mb-4 text-center">
                  ¿Querés guardar este pedido para consultarlo después?
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <button onClick={() => setMode('login')} className="btn-primary">
                    Iniciar sesión
                  </button>
                  <button onClick={() => setMode('register')} className="btn-secondary">
                    Crear cuenta
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => setMode('idle')}
                  className="text-[11px] tracking-[0.1em] uppercase text-green-olive hover:text-orange transition-colors mb-4"
                >
                  ← Volver
                </button>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] tracking-[0.15em] uppercase text-green-olive mb-1.5 font-light">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full border border-cream-warm bg-white px-4 py-2.5 text-sm text-green-deep font-light focus:outline-none focus:border-orange transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] tracking-[0.15em] uppercase text-green-olive mb-1.5 font-light">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full border border-cream-warm bg-white px-4 py-2.5 text-sm text-green-deep font-light focus:outline-none focus:border-orange transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Un momento…' : mode === 'login' ? 'Iniciar sesión y guardar' : 'Crear cuenta y guardar'}
                  </button>
                </form>

                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-cream-warm" />
                  <span className="text-[11px] text-gray-400 font-light">o</span>
                  <div className="flex-1 h-px bg-cream-warm" />
                </div>

                <button
                  onClick={handleGoogle}
                  disabled={loading}
                  className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar con Google
                </button>
              </>
            )}
          </div>
        )}

        {saved && (
          <p className="text-sm text-green-olive font-medium mb-8">
            ✓ Pedido guardado en tu cuenta —{' '}
            <Link href="/mis-pedidos" className="underline hover:text-orange">
              ver mis pedidos
            </Link>
          </p>
        )}

        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/"          className="btn-primary">Volver al inicio</Link>
          <Link href="/productos" className="btn-secondary">Seguir comprando</Link>
        </div>
      </div>
    </div>
  )
}