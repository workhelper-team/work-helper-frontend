export type QuestionStatus = 'WAITING' | 'ANSWERED' | string

export interface ExpertQuestionSummary {
  questionId: number
  caseId: number
  title: string
  status: QuestionStatus
  category: string | null
  answerCount: number
  createdAt: string
}

export interface ExpertAnswer {
  answerId: number
  questionId: number
  expertId: number
  content: string
  createdAt: string
}

export interface ExpertQuestionDetail {
  questionId: number
  caseId: number
  title: string
  content: string
  status: QuestionStatus
  createdAt: string
  answers: ExpertAnswer[]
}

export interface ExpertQuestionPage {
  content: ExpertQuestionSummary[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

// 전문가 전용 API의 목록과 상세는 서로 다른 응답 필드를 가진다.
export type ExpertQuestionStatus = 'WAITING' | 'ANSWERED'

export interface ExpertQuestionListItem {
  questionId: number
  caseId: number
  title: string
  status: ExpertQuestionStatus
  category: string | null
  answerCount: number
  createdAt: string
}

export interface ExpertQuestionListPage {
  content: ExpertQuestionListItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface ExpertQuestionDetailResponse {
  questionId: number
  caseId: number
  title: string
  content: string
  status: ExpertQuestionStatus
  createdAt: string
  answers: ExpertAnswer[]
}

export interface ExpertAnswerRequest {
  content: string
}
