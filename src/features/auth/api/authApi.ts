import { apiClient } from '@/shared/api/client'
import { useAuthStore } from '@/features/auth/store/authStore'
import type { LoginRequest, LoginResponse } from '@/features/auth/types/auth'

export async function login(request: LoginRequest) {
  const response = await apiClient.post<LoginResponse>('/api/auth/login', request)
  useAuthStore.getState().setAccessToken(response.data.accessToken)
  return response.data
}