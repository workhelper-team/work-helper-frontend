import type { CaseCategory, CaseStatus } from '../types/case'

export const caseCategoryLabels: Record<CaseCategory, string> = {
  WAGE: '임금',
}

export const caseStatusLabels: Record<CaseStatus, string> = {
  CREATED: '등록됨',
  IN_PROGRESS: '진행 중',
  CLOSED: '종료',
  ARCHIVED: '보관됨',
}
