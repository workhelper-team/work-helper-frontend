import api from './api'
import type {
  OcrUploadResponse,
  PetitionGenerateRequest,
  PetitionPreview,
} from '../types/petition.types'

export const uploadPetitionDocument = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post<OcrUploadResponse>('/petition/ocr', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const generatePetition = async (payload: PetitionGenerateRequest) => {
  const { data } = await api.post<PetitionPreview>('/petition/generate', payload)
  return data
}
