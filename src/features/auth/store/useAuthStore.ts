import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/auth.types';

interface AuthState {
  token: string | null;
  user: User | null;
  tokenExpiresAt: number | null;
  setAuth: (token: string, user: User, expiresIn: number) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      tokenExpiresAt: null,
      setAuth: (token, user, expiresIn) => set({
        token,
        user,
        tokenExpiresAt: Date.now() + expiresIn,
      }),
      clearAuth: () => set({ token: null, user: null, tokenExpiresAt: null }),
    }),
    { name: 'workhelper-auth-storage' }
  )
);