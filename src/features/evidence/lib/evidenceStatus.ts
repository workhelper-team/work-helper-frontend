import type { EvidenceStatus } from '../types/evidence'

export const statusLabel: Record<EvidenceStatus, string> = {
  PENDING: '분석 대기',
  PROCESSING: '분석 중',
  COMPLETED: '분석 완료',
  FAILED: '분석 실패',
}
