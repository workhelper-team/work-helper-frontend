import { apiClient } from '@/shared/api/client';
import type { BackendExpertApplication, ExpertApplication } from '../types/expertApplication';

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
