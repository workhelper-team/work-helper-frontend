export interface LoginRequest {
  email: string
  password: string
}

export interface AuthUser {
  id: number
  email: string
  name: string
  role: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  user: AuthUser
}