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

export interface ExpertApplication {
  id: number;
  date: string;
  name: string;
  office: string;
  license: string;
  file: string;
  email: string;
  status: '심사대기' | '승인완료' | '반려';
  selected?: boolean;
}