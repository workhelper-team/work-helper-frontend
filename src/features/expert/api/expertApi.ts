import { apiClient } from '@/shared/api/client'
import type {
  ExpertAnswer,
  ExpertAnswerRequest,
  ExpertQuestionDetail,
  ExpertQuestionDetailResponse,
  ExpertQuestionListPage,
  ExpertQuestionPage,
  ExpertQuestionStatus,
} from '@/features/expert/types/expertQuestion'

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

export async function getExpertQuestions(status?: ExpertQuestionStatus, page = 0, size = 20): Promise<ExpertQuestionListPage> {
  const response = await apiClient.get<ExpertQuestionListPage>('/api/expert/questions', {
    params: { status, page, size },
  })
  return response.data
}

export async function getExpertQuestionDetail(questionId: number): Promise<ExpertQuestionDetailResponse> {
  const response = await apiClient.get<ExpertQuestionDetailResponse>(`/api/expert/questions/${questionId}`)
  return response.data
}

export async function submitExpertAnswer(questionId: number, request: ExpertAnswerRequest): Promise<ExpertAnswer> {
  const response = await apiClient.post<ExpertAnswer>(`/api/expert/questions/${questionId}/answers`, request)
  return response.data
}
