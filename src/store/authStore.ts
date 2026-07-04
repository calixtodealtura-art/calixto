import { create }    from 'zustand'
import type { User } from 'firebase/auth'

export type UserRole = 'admin' | 'customer' | null

interface AuthState {
  user:        User | null
  role:        UserRole
  loading:     boolean
  setUser:     (user: User | null) => void
  setRole:     (role: UserRole) => void
  setLoading:  (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(set => ({
  user:       null,
  role:       null,
  loading:    true,
  setUser:    user    => set({ user }),
  setRole:    role    => set({ role }),
  setLoading: loading => set({ loading }),
}))