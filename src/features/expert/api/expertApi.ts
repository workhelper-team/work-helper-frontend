import { apiClient } from '@/shared/api/client'
import type { ExpertQuestionDetail, ExpertQuestionPage } from '@/features/expert/types/expertQuestion'

export async function getMyQuestions(caseId: string, page = 0, size = 20) {
  const response = await apiClient.get<ExpertQuestionPage>(`/api/cases/${caseId}/expert-questions`, { params: { page, size } })
  return response.data
}

export async function getMyQuestionDetail(caseId: string, questionId: number) {
  const response = await apiClient.get<ExpertQuestionDetail>(`/api/cases/${caseId}/expert-questions/${questionId}`)
  return response.data
}

export async function createQuestion(caseId: string, request: { title: string; content: string }) {
  const response = await apiClient.post(`/api/cases/${caseId}/expert-questions`, request)
  return response.data
}

// ==========================================================
// 전문가(승인된 노무사)용 API
//
// GET  /api/expert/questions
// GET  /api/expert/questions/{questionId}
// POST /api/expert/questions/{questionId}/answers
// ==========================================================

export async function getExpertQuestions(status?: string, page = 0, size = 20) {
  const response = await apiClient.get<ExpertQuestionPage>('/api/expert/questions', {
    params: { status: status === 'ALL' ? undefined : status, page, size },
  })
  return response.data
}

export async function getExpertQuestionDetail(questionId: number) {
  const response = await apiClient.get<ExpertQuestionDetail>(`/api/expert/questions/${questionId}`)
  return response.data
}

export async function submitExpertAnswer(questionId: number, content: string) {
  const response = await apiClient.post(`/api/expert/questions/${questionId}/answers`, { content })
  return response.data
}

// ==========================================================
// 관리자용 API (읽기 전용, 접근 기록은 서버에서 저장)
//
// GET /api/admin/expert-questions
// GET /api/admin/expert-questions/{questionId}
// ==========================================================

export async function getAdminExpertQuestions(status?: string, page = 0, size = 20) {
  const response = await apiClient.get<ExpertQuestionPage>('/api/admin/expert-questions', {
    params: { status: status === 'ALL' ? undefined : status, page, size },
  })
  return response.data
}

export async function getAdminExpertQuestionDetail(questionId: number) {
  const response = await apiClient.get<ExpertQuestionDetail>(`/api/admin/expert-questions/${questionId}`)
  return response.data
}
