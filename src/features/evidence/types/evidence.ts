export type EvidenceStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export interface PageResult<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface EvidenceSummary {
  evidenceId: number
  originalName: string
  mimeType: string
  description: string | null
  analysisStatus: EvidenceStatus
  createdAt: string
}

export interface EvidenceDetail extends EvidenceSummary {
  fileUrl: string | null
  extractedText: string | null
  analysisResult: unknown
}

export type EvidenceUploadResponse = EvidenceSummary

export interface EvidenceAnalysisResponse {
  evidenceId: number
  extractedText: string | null
  analysisResult: unknown
  analysisStatus: EvidenceStatus
}
