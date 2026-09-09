export interface OcrUploadResponse {
  documentId: string
  extractedText: string
}

export interface PetitionGenerateRequest {
  documentId: string
  additionalInfo?: string
}

export interface PetitionPreview {
  id: string
  content: string
  createdAt: string
}
