// ==========================================================
// 사건(Case) API
//
// 백엔드의 LaborCase 관련 REST API를 호출한다.
// ==========================================================

// 공통 axios 인스턴스 가져오기
//
// src/shared/api/client.ts에서 이미 만들어져 있으므로
// 여기서 axios.create()를 다시 만들지 않는다.
import { apiClient } from '../../../shared/api/client'

// 사건 관련 타입 가져오기
import type {
  Case,
  CaseListResponse,
  CreateCaseRequest,
  UpdateCaseRequest,
} from '../types/case'

// ==========================================================
// 사건 생성
//
// POST /api/cases
//
// 새로운 노동 사건을 생성한다.
// ==========================================================
export async function createCase(
  request: CreateCaseRequest,
): Promise<Case> {
  // 백엔드에 사건 생성 요청 전송
  const response = await apiClient.post<Case>(
    '/api/cases',
    request,
  )

  // 서버에서 받은 사건 데이터 반환
  return response.data
}

// ==========================================================
// 사건 목록 조회
//
// GET /api/cases
//
// status : 사건 상태 필터
// page   : 페이지 번호
// size   : 한 페이지의 사건 개수
// ==========================================================
export async function getCases(
  status?: string,
  page = 0,
  size = 10,
): Promise<CaseListResponse> {

  // GET 요청을 보낸다.
  //
  // params에 넣은 값은 자동으로
  // ?status=...&page=...&size=...
  // 형태로 전송된다.
  const response = await apiClient.get<CaseListResponse>(
    '/api/cases',
    {
      params: {
        status,
        page,
        size,
      },
    },
  )

  // 페이지 형태의 사건 목록 반환
  return response.data
}

// ==========================================================
// 사건 상세 조회
//
// GET /api/cases/{caseId}
// ==========================================================
export async function getCase(
  caseId: number,
): Promise<Case> {

  // URL 뒤에 사건 ID를 붙인다.
  const response = await apiClient.get<Case>(
    `/api/cases/${caseId}`,
  )

  // 사건 상세 정보 반환
  return response.data
}

// ==========================================================
// 사건 수정
//
// PATCH /api/cases/{caseId}
// ==========================================================
export async function updateCase(
  caseId: number,
  request: UpdateCaseRequest,
): Promise<Case> {

  // 수정할 사건 정보를 서버에 전달
  const response = await apiClient.patch<Case>(
    `/api/cases/${caseId}`,
    request,
  )

  // 수정된 사건 정보 반환
  return response.data
}