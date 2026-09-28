export interface LegalDocumentSummary {
  legalDocumentId: number
  title: string
  snippet?: string | null
  metadata?: Record<string, unknown> | null
  sourceType: string
  sourceUrl: string | null
}

export interface LegalDocumentDetail extends LegalDocumentSummary {
  fullText: string
  metadata: Record<string, unknown> | null
}

export interface LegalPageResult<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}
