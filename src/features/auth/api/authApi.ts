import { LoginRequest, AuthResponse, SignupRequest } from '../types/auth.types';
import { apiClient } from '@/shared/api/client';

export const loginApi = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post('/api/auth/login', credentials);
  return response.data;
};

export const refreshLoginApi = async (): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/api/auth/extend');
  return response.data;
};

export const logoutApi = async (): Promise<void> => {
  await apiClient.post('/api/auth/logout');
};

export const checkEmailAvailabilityApi = async (email: string): Promise<boolean> => {
  const response = await apiClient.get<boolean>('/api/auth/email-availability', {
    params: { email },
  });
  return response.data;
};

export const signupApi = async (data: SignupRequest) => {
  if (data.role === 'USER') {
    const response = await apiClient.post('/api/auth/signup', {
      email: data.email,
      password: data.password,
      name: data.name,
    });

    return response.data;
  }

  const formData = new FormData();
  formData.append('email', data.email);
  formData.append('password', data.password);
  formData.append('name', data.name);
  formData.append('organization', data.office ?? '');
  formData.append('licenseNumber', data.licenseNo ?? '');
  if (data.certificateFile) formData.append('licenseFile', data.certificateFile);

  const response = await apiClient.post('/api/auth/expert-signup', formData);
  return response.data;
};
