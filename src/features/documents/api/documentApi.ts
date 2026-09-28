import { apiClient } from '@/shared/api/client'
import type { DocumentDetail, DocumentSummary, DocumentUpdateRequest } from '../types/document'

const path = (caseId: string) => `/api/cases/${caseId}/documents`

export async function getDocuments(caseId: string) {
  const response = await apiClient.get<DocumentSummary[]>(path(caseId))
  return response.data
}

export async function createDocument(caseId: string) {
  const response = await apiClient.post<DocumentDetail>(path(caseId))
  return response.data
}

export async function getDocument(caseId: string, documentId: number) {
  const response = await apiClient.get<DocumentDetail>(`${path(caseId)}/${documentId}`)
  return response.data
}

export async function updateDocument(caseId: string, documentId: number, request: DocumentUpdateRequest) {
  const response = await apiClient.patch<DocumentDetail>(`${path(caseId)}/${documentId}`, request)
  return response.data
}

export async function getDocumentPdf(caseId: string, documentId: number) {
  const response = await apiClient.get<Blob>(`${path(caseId)}/${documentId}/file`, { responseType: 'blob' })
  return { blob: response.data, disposition: response.headers['content-disposition'] as string | undefined }
}
