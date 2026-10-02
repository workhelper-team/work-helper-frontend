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

export interface BackendExpertApplication {
  expertId: number;
  name: string;
  email: string;
  organization: string;
  licenseNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}
