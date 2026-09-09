export interface CaseSummary {
  id: number
  title: string
  status: string
  createdAt: string
}

export interface CaseDetail extends CaseSummary {
  description: string
  updatedAt: string
}

export interface CreateCaseRequest {
  title: string
  description: string
}
