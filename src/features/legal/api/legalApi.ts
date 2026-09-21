import { apiClient } from '@/shared/api/client'
import type { LegalDocumentDetail, LegalDocumentSummary, LegalPageResult } from '@/features/legal/types/legalDocument'

export async function searchLegalDocuments(query: string, sourceType: string, page: number, size = 20) {
  const response = await apiClient.get<LegalPageResult<LegalDocumentSummary>>('/api/legal-documents', {
    params: { query, sourceType: sourceType || undefined, page, size },
  })
  return response.data
}

export async function getLegalDocumentDetail(legalDocumentId: number) {
  const response = await apiClient.get<LegalDocumentDetail>(`/api/legal-documents/${legalDocumentId}`)
  return response.data
}
