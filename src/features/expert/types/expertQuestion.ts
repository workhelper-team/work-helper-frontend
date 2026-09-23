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

export interface ExpertQuestionDetail extends ExpertQuestionSummary {
  content: string
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