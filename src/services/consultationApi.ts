import api from './api'
import type { ConsultationRequest, ConsultationResponse } from '../types/consultation.types'

export const sendConsultationMessage = async (payload: ConsultationRequest) => {
  const { data } = await api.post<ConsultationResponse>('/consultation/chat', payload)
  return data
}
