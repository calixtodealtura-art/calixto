'use client'

import { useState }              from 'react'
import { useRouter }             from 'next/navigation'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { doc, getDoc, setDoc }   from 'firebase/firestore'
import { auth, db }              from '@/lib/firebase'
import toast                     from 'react-hot-toast'

const googleProvider = new GoogleAuthProvider()

export default function AdminLoginPage() {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleGoogleLogin() {
    setLoading(true)
    try {
      // 1. Login con Google
      const { user } = await signInWithPopup(auth, googleProvider)

      // 2. Verificar role: 'admin' en Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      const role    = userDoc.data()?.role

      if (role !== 'admin') {
        await auth.signOut()
        toast.error('Tu cuenta no tiene permisos de administrador')
        setLoading(false)
        return
      }

      // 3. Guardar token en cookie para el middleware
      const token = await user.getIdToken()
      document.cookie = `calixto-admin-token=${token}; path=/; max-age=3600; SameSite=Strict`

      toast.success(`Bienvenido, ${user.displayName?.split(' ')[0]}`)
      router.push('/admin/ordenes')

    } catch (err) {
      console.error(err)
      toast.error('No se pudo iniciar sesión con Google')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-green-deep flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-12">
          <p className="font-serif text-4xl font-semibold text-cream tracking-widest">
            CALIXTO
          </p>
          <p className="text-[10px] tracking-[0.25em] uppercase text-gold mt-1.5 font-light">
            Panel de administración
          </p>
        </div>

        {/* Google button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3
                     bg-white text-gray-700 px-6 py-3.5
                     text-sm font-medium tracking-wide
                     transition-all duration-200
                     hover:bg-gray-50 hover:shadow-lg
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* Google icon SVG */}
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
          </svg>
          {loading ? 'Ingresando…' : 'Continuar con Google'}
        </button>

        <p className="text-center text-[11px] text-green-sage/50 mt-8 font-light">
          Solo cuentas autorizadas pueden acceder
        </p>
      </div>
    </div>
  )
}