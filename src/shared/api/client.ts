import axios from 'axios'
import { useAuthStore } from '@/features/auth/store/useAuthStore'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      useAuthStore.getState().clearAuth()

      if (window.location.pathname !== '/login') {
        window.location.replace('/login')
      }
    }

    return Promise.reject(error)
  },
)
