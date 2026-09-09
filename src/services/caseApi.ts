import api from './api'
import type { CaseDetail, CaseSummary, CreateCaseRequest } from '../types/case.types'

export const getCases = async () => {
  const { data } = await api.get<CaseSummary[]>('/cases')
  return data
}

export const getCaseDetail = async (caseId: number) => {
  const { data } = await api.get<CaseDetail>(`/cases/${caseId}`)
  return data
}

export const createCase = async (payload: CreateCaseRequest) => {
  const { data } = await api.post<CaseDetail>('/cases', payload)
  return data
}
