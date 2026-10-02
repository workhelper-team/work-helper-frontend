export interface User {
  id: number;
  email: string;
  name: string;
  role: 'GENERAL' | 'EXPERT' | 'ADMIN';
  expertStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: User;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  role: 'USER' | 'EXPERT';
  office?: string;
  licenseNo?: string;
  certificateFile?: File | null;
}
