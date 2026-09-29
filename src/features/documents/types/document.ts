export type BusinessType = 'BUSINESS' | 'CONSTRUCTION'
export type EmploymentStatus = 'EMPLOYED' | 'RESIGNED'
export type ContractType = 'WRITTEN' | 'VERBAL'

export interface Complainant {
  name: string | null
  birthDate: string | null
  address: string | null
  phone: string | null
  mobilePhone: string | null
  email: string | null
  receiveStatus: boolean | null
}

export interface Respondent {
  companyName: string | null
  name: string | null
  phone: string | null
  address: string | null
  businessType: BusinessType | null
  employeeCount: string | null
}

export interface Facts {
  hireDate: string | null
  resignationDate: string | null
  employmentStatus: EmploymentStatus | null
  jobDescription: string | null
  payDay: string | null
  contractType: ContractType | null
  unpaidWages: number | null
  unpaidSeverancePay: number | null
  unpaidOtherAmount: number | null
}

export interface ComplaintContent {
  claimReason: string
  targetLaborOffice: string | null
  totalUnpaidAmount: number | null
}

export interface DocumentData {
  complainant: Complainant
  respondent: Respondent
  facts: Facts
  content: ComplaintContent
}

export interface DocumentDetail extends DocumentData {
  documentId: number
  caseId: number
  documentType: 'COMPLAINT'
  title: string | null
}

export interface DocumentSummary {
  documentId: number
  caseId: number
  documentType: 'COMPLAINT'
  title: string | null
  createdAt: string
  updatedAt: string
}

export interface DocumentUpdateRequest extends DocumentData {
  title: string | null
}
