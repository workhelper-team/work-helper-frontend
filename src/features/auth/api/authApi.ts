import { LoginRequest, AuthResponse, SignupRequest, ExpertApplication } from '../types/auth.types';
import { apiClient } from '@/shared/api/client';

export const loginApi = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post('/api/auth/login', credentials);
  return response.data;
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

export const getExpertApplicationsApi = async (): Promise<ExpertApplication[]> => {
  const response = await apiClient.get<BackendExpertApplication[]>('/api/admin/experts');
  return response.data.map((application) => ({
    id: application.expertId,
    date: formatApplicationDate(application.createdAt),
    name: application.name,
    office: application.organization,
    license: application.licenseNumber,
    file: '자격증 보기',
    email: application.email,
    status: toUiStatus(application.status),
    selected: false,
  }));
};

export const updateExpertStatusApi = async (ids: number[], status: '승인완료' | '반려') => {
  const response = await apiClient.patch('/api/admin/experts/status', {
    expertIds: ids,
    status: status === '승인완료' ? 'APPROVED' : 'REJECTED',
  });
  return response.data;
};

export const getExpertLicenseFileApi = async (expertId: number) => {
  const response = await apiClient.get(`/api/admin/experts/${expertId}/license-file`, {
    responseType: 'blob',
  });
  return response.data;
};

interface BackendExpertApplication {
  expertId: number;
  name: string;
  email: string;
  organization: string;
  licenseNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

function formatApplicationDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).replace(/ /g, '');
}

function toUiStatus(status: BackendExpertApplication['status']): ExpertApplication['status'] {
  if (status === 'APPROVED') return '승인완료';
  if (status === 'REJECTED') return '반려';
  return '심사대기';
}