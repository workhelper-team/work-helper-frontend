import { create } from 'zustand'
import type { AuthUser } from '../types/auth.types'

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  setAuth: (user: AuthUser, accessToken: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  setAuth: (user, accessToken) => {
    localStorage.setItem('accessToken', accessToken)
    set({ user, accessToken })
  },
  clearAuth: () => {
    localStorage.removeItem('accessToken')
    set({ user: null, accessToken: null })
  },
}))
