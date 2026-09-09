export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface ConsultationRequest {
  message: string
}

export interface ConsultationResponse {
  reply: string
}
