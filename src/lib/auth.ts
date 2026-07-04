import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase'
import type { UserProfile } from '@/types'

const googleProvider = new GoogleAuthProvider()

// ── Crear perfil en Firestore al registrarse ───────────────────────────────
async function createUserProfile(user: User): Promise<void> {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      uid:         user.uid,
      email:       user.email,
      displayName: user.displayName,
      photoURL:    user.photoURL,
      createdAt:   serverTimestamp(),
    })
  }
}

// ── Registro con email/password ────────────────────────────────────────────
export async function registerWithEmail(
  email: string,
  password: string
): Promise<User> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  await createUserProfile(user)
  return user
}

// ── Login con email/password ───────────────────────────────────────────────
export async function loginWithEmail(
  email: string,
  password: string
): Promise<User> {
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  return user
}

// ── Login con Google ───────────────────────────────────────────────────────
export async function loginWithGoogle(): Promise<User> {
  const { user } = await signInWithPopup(auth, googleProvider)
  await createUserProfile(user)
  return user
}

// ── Sign out ───────────────────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}

// ── Obtener perfil del usuario ─────────────────────────────────────────────
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  return snap.data() as UserProfile
}

// ── Observer de autenticación ──────────────────────────────────────────────
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}
// ── Cookie de sesión para el panel admin (consumida por proxy.ts) ─────────
export async function setAdminSessionCookie(user: User): Promise<void> {
  const token = await user.getIdToken()
  document.cookie = `calixto-admin-token=${token}; path=/; max-age=3600; SameSite=Strict`
}

export function clearAdminSessionCookie(): void {
  document.cookie = 'calixto-admin-token=; path=/; max-age=0'
}