import { apiClient } from '@/shared/api/client'
import type {
  EvidenceAnalysisResponse,
  EvidenceDetail,
  EvidenceSummary,
  EvidenceUploadResponse,
  PageResult,
} from '@/features/evidence/types/evidence'

export async function getEvidences(caseId: string, page: number, size = 20) {
  const response = await apiClient.get<PageResult<EvidenceSummary>>(`/api/cases/${caseId}/evidences`, { params: { page, size } })
  return response.data
}

export async function uploadEvidence(caseId: string, file: File, description: string) {
  const formData = new FormData()
  formData.append('file', file)
  if (description.trim()) formData.append('description', description.trim())
  const response = await apiClient.post<EvidenceUploadResponse>(`/api/cases/${caseId}/evidences`, formData)
  return response.data
}

export async function getEvidenceDetail(caseId: string, evidenceId: number) {
  const response = await apiClient.get<EvidenceDetail>(`/api/cases/${caseId}/evidences/${evidenceId}`)
  return response.data
}

export async function analyzeEvidence(caseId: string, evidenceId: number) {
  const response = await apiClient.post<EvidenceAnalysisResponse>(`/api/cases/${caseId}/evidences/${evidenceId}/analysis`)
  return response.data
}

export async function deleteEvidence(caseId: string, evidenceId: number) {
  await apiClient.delete(`/api/cases/${caseId}/evidences/${evidenceId}`)
}
