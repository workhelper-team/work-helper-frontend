import { useEffect, useState } from 'react'
import type { EvidenceDetail } from '@/features/evidence/types/evidence'
import { statusLabel } from '../lib/evidenceStatus'

interface EvidenceDetailModalProps {
  detail: EvidenceDetail
  processing: boolean
  saving: boolean
  onClose: () => void
  onAnalyze: (id: number) => void
  onSave: (id: number, extractedText: string) => void
  onDelete: (id: number) => void
}

export function EvidenceDetailModal({ detail, processing, saving, onClose, onAnalyze, onSave, onDelete }: EvidenceDetailModalProps) {
  const [extractedText, setExtractedText] = useState(detail.extractedText ?? '')
  useEffect(() => { setExtractedText(detail.extractedText ?? '') }, [detail.evidenceId, detail.extractedText])
  const canAnalyze = detail.analysisStatus === 'PENDING' || detail.analysisStatus === 'FAILED'

  return <div className="modal-backdrop" onClick={onClose}>
    <section className="detail-modal" onClick={(event) => event.stopPropagation()}>
      <button className="modal-close" onClick={onClose}>×</button>
      <h2>내 증빙 서류</h2>
      <p className="modal-subtitle">분석 결과를 확인하고 추출 텍스트를 수정할 수 있습니다.</p>
      <h3>{detail.originalName}</h3>
      {detail.fileUrl && detail.mimeType.startsWith('image/') && <img className="evidence-preview" src={detail.fileUrl} alt={detail.originalName} />}
      <p>분석 상태: {processing ? statusLabel.PROCESSING : statusLabel[detail.analysisStatus]}</p>
      {detail.description && <div className="detail-copy"><strong>상황 설명</strong><p>{detail.description}</p></div>}
      <div className="detail-copy"><strong>AI 분석 요약</strong><p>{detail.analysisResult?.analysisSummary || '분석 요약이 없습니다.'}</p></div>
      <div className="detail-copy"><label htmlFor="extracted-text"><strong>OCR 추출 텍스트</strong></label><textarea id="extracted-text" className="full-text" rows={8} disabled={detail.analysisStatus !== 'COMPLETED' || saving || processing} value={extractedText} onChange={(event) => setExtractedText(event.target.value)} /></div>
      {detail.analysisStatus === 'COMPLETED' && <button className="navy-button" disabled={saving || processing || extractedText === (detail.extractedText ?? '')} onClick={() => onSave(detail.evidenceId, extractedText)}>{saving ? '저장 중' : '수정 내용 저장'}</button>}
      {canAnalyze && <button className="navy-button" disabled={processing} onClick={() => onAnalyze(detail.evidenceId)}>{processing ? '분석 중' : detail.analysisStatus === 'FAILED' ? '다시 분석' : '분석하기'}</button>}
      {detail.analysisStatus === 'PROCESSING' && <p role="status">분석 중입니다.</p>}
      <button className="danger-button" disabled={processing} onClick={() => onDelete(detail.evidenceId)}>삭제하기</button>
    </section>
  </div>
}
