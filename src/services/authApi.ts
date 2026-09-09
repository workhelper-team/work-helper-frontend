import api from './api'
import type { AuthResponse, LoginRequest, SignupRequest } from '../types/auth.types'

export const login = async (payload: LoginRequest) => {
  const { data } = await api.post<AuthResponse>('/auth/login', payload)
  return data
}

export const signup = async (payload: SignupRequest) => {
  const { data } = await api.post<AuthResponse>('/auth/signup', payload)
  return data
}
