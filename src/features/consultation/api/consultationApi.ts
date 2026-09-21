import { apiClient } from '../../../shared/api/client'

import type {
  ConsultationMessage,
  SendConsultationMessageRequest,
} from '../types/consultation'

// ==========================================================
// 사건의 상담 메시지 목록 조회
//
// GET /api/cases/{caseId}/messages
//
// 특정 사건에 등록된 상담 메시지를
// 생성 시간 순서대로 받아온다.
// ==========================================================
export async function getConsultationMessages(
  caseId: number,
): Promise<ConsultationMessage[]> {
  // 백엔드에 상담 메시지 목록을 요청한다.
  const response = await apiClient.get<ConsultationMessage[]>(
    `/api/cases/${caseId}/messages`,
  )

  // Axios 응답에서 실제 데이터만 반환한다.
  return response.data
}


// ==========================================================
// 상담 메시지 전송
//
// POST /api/cases/{caseId}/messages
//
// 사용자가 입력한 상담 내용을
// 특정 사건에 등록한다.
// ==========================================================
export async function sendConsultationMessage(
  caseId: number,
  request: SendConsultationMessageRequest,
): Promise<ConsultationMessage> {
  // 백엔드에 상담 메시지를 전송한다.
  const response = await apiClient.post<ConsultationMessage>(
    `/api/cases/${caseId}/messages`,
    request,
  )

  // 저장된 상담 메시지를 반환한다.
  return response.data
}