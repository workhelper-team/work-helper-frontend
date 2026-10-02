import { useState } from 'react'
import type { EvidenceSummary } from '@/features/evidence/types/evidence'
import { statusLabel } from '../lib/evidenceStatus'

interface EvidenceListProps {
  items: EvidenceSummary[]
  loading: boolean
  busyEvidenceId: number | null
  page: number
  totalPages: number
  onAnalyze: (id: number) => void
  onSelect: (id: number) => void
  onPageChange: (page: number) => void
}

export function EvidenceList({ items, loading, busyEvidenceId, page, totalPages, onAnalyze, onSelect, onPageChange }: EvidenceListProps) {
  const [query, setQuery] = useState('')
  const [documentType, setDocumentType] = useState('ALL')
  const typeKeywords: Record<string, string[]> = { CONTRACT: ['근로계약서', '계약서'], PAYSLIP: ['급여명세서', '급여', '월급'], TRANSACTION: ['거래내역', '거래', '입출금'] }
  const filteredItems = items.filter((item) => {
    const searchableText = `${item.originalName} ${item.description || ''}`.toLowerCase()
    return searchableText.includes(query.toLowerCase()) && (documentType === 'ALL' || typeKeywords[documentType].some((keyword) => searchableText.includes(keyword)))
  })

  return <>
    <div className="file-toolbar">
      <label className="search-input">⌕<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="파일명 검색" /></label>
      <div className="filter-tabs">
        <button className={documentType === 'ALL' ? 'active' : ''} onClick={() => setDocumentType('ALL')}>전체</button>
        <button className={documentType === 'CONTRACT' ? 'active' : ''} onClick={() => setDocumentType('CONTRACT')}>근로계약서</button>
        <button className={documentType === 'PAYSLIP' ? 'active' : ''} onClick={() => setDocumentType('PAYSLIP')}>급여명세서</button>
        <button className={documentType === 'TRANSACTION' ? 'active' : ''} onClick={() => setDocumentType('TRANSACTION')}>거래내역</button>
      </div>
    </div>
    <section className="file-list">
      {loading ? <div className="empty-state">증빙서류를 불러오는 중입니다.</div> : filteredItems.length === 0 ? <div className="empty-state"><strong>등록된 증빙서류가 없습니다.</strong><span>사건에 필요한 서류를 추가해보세요.</span></div> : filteredItems.map((item) => {
        const processing = item.analysisStatus === 'PROCESSING' || busyEvidenceId === item.evidenceId
        const canAnalyze = item.analysisStatus === 'PENDING' || item.analysisStatus === 'FAILED'
        return <article className="file-card" key={item.evidenceId} onClick={() => onSelect(item.evidenceId)}>
          <div className={`file-type ${item.mimeType.startsWith('image/') ? 'image-type' : ''}`}>{item.mimeType.startsWith('image/') ? '▧' : '▤'}</div>
          <div className="file-info"><strong>{item.originalName}</strong><span>유형: {item.mimeType === 'application/pdf' ? 'PDF' : '이미지'} | 등록일: {new Date(item.createdAt).toLocaleDateString('ko-KR')}</span></div>
          <span className={`analysis-badge ${item.analysisStatus === 'COMPLETED' ? 'done' : ''}`}>{statusLabel[item.analysisStatus]}</span>
          <button className="navy-button small" disabled={!canAnalyze || processing || busyEvidenceId !== null} onClick={(event) => { event.stopPropagation(); onAnalyze(item.evidenceId) }}>{processing ? '분석 중' : item.analysisStatus === 'FAILED' ? '다시 분석' : '분석하기'}</button>
        </article>
      })}
    </section>
    {totalPages > 1 && <div className="pagination"><button disabled={page === 0} onClick={() => onPageChange(page - 1)}>‹</button><b>{page + 1}</b><span>{totalPages}</span><button disabled={page + 1 >= totalPages} onClick={() => onPageChange(page + 1)}>›</button></div>}
  </>
}
