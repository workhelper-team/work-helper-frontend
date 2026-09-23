// ==========================================================
// 사건(Case) 관련 타입 정의
//
// 백엔드 LaborCase에서 내려주는 데이터를
// 프론트엔드에서 어떤 형태로 사용할지 정의한다.
// ==========================================================

// ==========================================================
// 사건 카테고리
//
// 현재 MVP에서는 WAGE(임금) 사건만 지원한다.
// 백엔드의 CaseCategory enum과 동일하게 맞춘다.
// ==========================================================
export type CaseCategory = 'WAGE'

// ==========================================================
// 사건 상태
//
// 백엔드 CaseStatus enum과 동일하게 맞춘다.
// ==========================================================
export type CaseStatus =
  | 'CREATED'
  | 'IN_PROGRESS'
  | 'CLOSED'
  | 'ARCHIVED'

// ==========================================================
// 사건 응답 타입
//
// GET /api/cases
// GET /api/cases/{caseId}
//
// 등의 API에서 받는 사건 데이터 구조
// ==========================================================
export interface Case {
  // 사건 ID
  caseId: number

  // 사건 제목
  title: string

  // 사건 유형
  category: CaseCategory

  // 사건 상태
  status: CaseStatus

  // 사건 요약
  // 아직 요약이 없을 수 있으므로 null 허용
  summary: string | null

  // 사건 생성 시간
  createdAt: string

  // 사건 수정 시간
  updatedAt: string
}

// ==========================================================
// 사건 생성 요청
//
// POST /api/cases
//
// initialDescription은 사건 생성 시
// 첫 번째 USER 상담 메시지로 저장된다.
// ==========================================================
export interface CreateCaseRequest {
  // 사건 제목
  title: string

  // 사건 유형
  // 현재는 WAGE만 사용
  category: CaseCategory

  // 사건 생성과 동시에 입력하는 최초 상담 내용
  initialDescription?: string
}

// ==========================================================
// 사건 수정 요청
//
// PATCH /api/cases/{caseId}
//
// 수정하지 않는 필드는 보내지 않을 수 있도록
// 모두 optional(?)로 정의한다.
// ==========================================================
export interface UpdateCaseRequest {
  // 사건 제목
  title?: string

  // 사건 유형
  category?: CaseCategory

  // 사건 상태
  status?: CaseStatus

  // 사건 요약
  summary?: string
}

// ==========================================================
// 사건 목록 응답
//
// GET /api/cases
//
// Spring Data JPA의 Page 형태를 프론트에서 사용하기 위한 타입
// ==========================================================
export interface CaseListResponse {
  // 현재 페이지에 포함된 사건 목록
  content: Case[]

  // 전체 사건 개수
  totalElements: number

  // 전체 페이지 수
  totalPages: number

  // 한 페이지에 표시되는 데이터 개수
  size: number

  // 현재 페이지 번호
  // 백엔드는 0부터 시작
  number: number
}