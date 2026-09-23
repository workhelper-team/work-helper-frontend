import { create } from 'zustand'

const accessTokenKey = 'workhelper.accessToken'

interface AuthState {
  accessToken: string | null
  setAccessToken: (accessToken: string) => void
  clearAccessToken: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem(accessTokenKey),
  setAccessToken: (accessToken) => {
    localStorage.setItem(accessTokenKey, accessToken)
    set({ accessToken })
  },
  clearAccessToken: () => {
    localStorage.removeItem(accessTokenKey)
    set({ accessToken: null })
  },
}))

export function getAccessToken() {
  return useAuthStore.getState().accessToken
}