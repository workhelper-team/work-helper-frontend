import { useEffect, useRef, useState } from 'react'

import {
  analyzeEvidence,
  deleteEvidence,
  getEvidenceDetail,
  getEvidences,
  uploadEvidence,
} from '@/features/evidence/api/evidenceApi'

import type {
  EvidenceDetail,
  EvidenceSummary,
} from '@/features/evidence/types/evidence'

import { SiteHeader } from '@/shared/components/layout/SiteHeader'
import { CaseSelector } from '@/shared/components/common/CaseSelector'
import { useCaseSelector } from '@/shared/hooks/useCaseSelector'

const statusLabel: Record<string, string> = {
  PENDING: '분석 대기',
  PROCESSING: '분석 중',
  COMPLETED: '분석완료',
  FAILED: '분석 실패',
}

function formatAnalysisResult(result: unknown) {
  if (result === null || result === undefined) return null
  if (typeof result === 'string') return result.trim() ? result : null
  try {
    return JSON.stringify(result, null, 2)
  } catch {
    return String(result)
  }
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <div className="footer-links">
            <strong>이용약관</strong>
            <a href="#privacy">개인정보처리방침</a>
            <a href="#email">이메일무단수집거부</a>
            <a href="#sitemap">찾아오시는 길</a>
          </div>

          <p>
            (우) 04520 서울특별시 중구 청계천로 8 고용노동복지센터 / 대표번호: 1544-0000
            <br />
            상담가능시간: 평일 09시 ~ 오후 6시 (토/일요일, 공휴일 휴무)
            <br />
            워크헬퍼는 법률 전문가의 공식적인 의견을 대신하지 않습니다.
          </p>

          <small>Copyright © WorkHelper. All Rights Reserved.</small>
        </div>

        <span className="policy-mark">● 공공 정보 보안 규격 준수</span>
      </div>
    </footer>
  )
}

export function EvidencePage() {
  const { caseId, cases, casesLoading, casesError, hasNoCase, changeCase } =
    useCaseSelector('evidences')

  const [items, setItems] = useState<EvidenceSummary[]>([])
  const [detail, setDetail] = useState<EvidenceDetail | null>(null)

  const [query, setQuery] = useState('')
  const [documentType, setDocumentType] = useState('ALL')

  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)

  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const [previewCache, setPreviewCache] = useState<Record<number, string>>({})
  const [hoverItem, setHoverItem] = useState<{ id: number; top: number; left: number } | null>(null)

  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!selectedFile) {
      setFilePreviewUrl(null)
      return
    }

    if (!['image/jpeg', 'image/png'].includes(selectedFile.type)) {
      setSelectedFile(null)
      setMessage('JPEG 또는 PNG 파일만 선택할 수 있습니다.')
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setSelectedFile(null)
      setMessage('파일 크기는 10MB 이하만 선택할 수 있습니다.')
      return
    }

    const url = URL.createObjectURL(selectedFile)
    setFilePreviewUrl(url)

    return () => URL.revokeObjectURL(url)
  }, [selectedFile])

  async function loadEvidence() {
    if (!caseId) return

    setLoading(true)

    try {
      const result = await getEvidences(caseId, page)
      setItems(result.content ?? [])
      setTotalPages(result.totalPages ?? 0)
      setMessage('')
    } catch {
      setMessage('증빙서류를 불러오지 못했습니다. 백엔드 연결을 확인해주세요.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(0)
    setPreviewCache({})
  }, [caseId])

  useEffect(() => {
    if (!caseId) {
      setItems([])
      setTotalPages(0)
      if (!casesLoading) setLoading(false)
      return
    }

    void loadEvidence()
  }, [caseId, page, casesLoading])

  async function handleUpload() {
    if (!caseId) return

    const file = selectedFile
    if (!file) {
      setMessage('업로드할 JPEG 또는 PNG 파일을 선택해주세요.')
      return
    }

    setUploading(true)

    try {
      await uploadEvidence(caseId, file, description)

      setDescription('')
      setSelectedFile(null)
      if (fileRef.current) fileRef.current.value = ''

      setMessage('증빙서류가 등록되었습니다.')
      await loadEvidence()
    } catch {
      setMessage('업로드에 실패했습니다. JPEG 또는 PNG 파일인지 확인해주세요.')
    } finally {
      setUploading(false)
    }
  }

  async function openDetail(id: number) {
    if (!caseId) return

    try {
      const result = await getEvidenceDetail(caseId, id)
      setDetail(result)

      if (result.fileUrl) {
        setPreviewCache((prev) => ({ ...prev, [id]: result.fileUrl as string }))
      }
    } catch {
      setMessage('상세 정보를 불러오지 못했습니다.')
    }
  }

  async function handleImageHover(item: EvidenceSummary, event: React.MouseEvent<HTMLElement>) {
    if (!caseId || !item.mimeType.startsWith('image/')) return

    const rect = event.currentTarget.getBoundingClientRect()
    setHoverItem({ id: item.evidenceId, top: rect.top, left: rect.right + 16 })

    if (previewCache[item.evidenceId]) return

    try {
      const result = await getEvidenceDetail(caseId, item.evidenceId)
      if (result.fileUrl) {
        setPreviewCache((prev) => ({ ...prev, [item.evidenceId]: result.fileUrl as string }))
      }
    } catch {
      // 미리보기 실패는 조용히 무시한다.
    }
  }

  function handleImageHoverLeave() {
    setHoverItem(null)
  }

  async function handleAnalyze(id: number) {
    if (!caseId) return

    try {
      await analyzeEvidence(caseId, id)
      await loadEvidence()
      setMessage('분석 요청을 전송했습니다.')
    } catch {
      setMessage('분석 요청에 실패했습니다.')
    }
  }

  async function handleDelete(id: number) {
    if (!caseId) return
    if (!window.confirm('이 증빙서류를 삭제하시겠습니까?')) return

    try {
      await deleteEvidence(caseId, id)
      setDetail(null)
      await loadEvidence()
      setMessage('증빙서류가 삭제되었습니다.')
    } catch {
      setMessage('삭제에 실패했습니다.')
    }
  }

  const typeKeywords: Record<string, string[]> = {
    CONTRACT: ['근로계약서', '계약서'],
    PAYSLIP: ['급여명세서', '급여', '월급'],
    TRANSACTION: ['거래내역', '거래', '입출금'],
  }

  const filteredItems = items.filter((item) => {
    const searchableText = `${item.originalName} ${item.description || ''}`.toLowerCase()
    const matchesQuery = searchableText.includes(query.toLowerCase())
    const matchesType =
      documentType === 'ALL' || typeKeywords[documentType].some((keyword) => searchableText.includes(keyword))
    return matchesQuery && matchesType
  })

  const analysisResultText = detail ? formatAnalysisResult(detail.analysisResult) : null

  return (
    <div className="site-page">
      <SiteHeader />

      <section className="page-banner">
        <div className="container">
          <p className="breadcrumb">홈 &gt; 내 사건 관리 &gt; 내 증빙 서류함</p>
          <h1>내 증빙 서류함</h1>
          <p>이전에 분석한 서류를 불러와 진정서에 반영해보세요.</p>
        </div>
      </section>

      <main className="container evidence-main">
        <div className="section-title-row">
          <div>
            <h2>내 증빙 서류함</h2>
            <p>근로계약서, 급여명세서 등 사건에 필요한 자료를 관리합니다.</p>
          </div>
        </div>

        <div className="upload-panel">
          <label className="upload-preview-box">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
            />

            {filePreviewUrl ? (
              <img src={filePreviewUrl} alt={selectedFile?.name || '선택한 서류'} />
            ) : (
              <div className="upload-dropzone">
                <span className="upload-dropzone-icon">＋</span>
                <strong>서류 이미지를 선택하세요</strong>
                <small>JPEG, PNG · 최대 10MB</small>
              </div>
            )}
          </label>

          <div className="upload-side">
            <span className="upload-side-label">자료 설명</span>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="예) 2026년 3월 급여명세서"
              rows={6}
            />

            {selectedFile && (
              <p className="upload-filename">
                선택 파일: {selectedFile.name}
                <button
                  type="button"
                  className="upload-clear"
                  onClick={() => {
                    setSelectedFile(null)
                    if (fileRef.current) fileRef.current.value = ''
                  }}
                >
                  선택 취소
                </button>
              </p>
            )}

            <button
              className="navy-button"
              disabled={!caseId || !selectedFile || uploading}
              onClick={() => void handleUpload()}
            >
              {uploading ? '업로드 중...' : '업로드'}
            </button>
          </div>
        </div>

        {(cases.length > 1 || hasNoCase || casesError) && (
          <CaseSelector
            caseId={caseId}
            cases={cases}
            loading={casesLoading}
            hasNoCase={hasNoCase}
            error={casesError}
            onChange={changeCase}
          />
        )}

        <div className="file-toolbar">
          <label className="search-input">
            ⌕
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="파일명 검색" />
          </label>

          <div className="filter-tabs">
            <button className={documentType === 'ALL' ? 'active' : ''} onClick={() => setDocumentType('ALL')}>전체</button>
            <button className={documentType === 'CONTRACT' ? 'active' : ''} onClick={() => setDocumentType('CONTRACT')}>근로계약서</button>
            <button className={documentType === 'PAYSLIP' ? 'active' : ''} onClick={() => setDocumentType('PAYSLIP')}>급여명세서</button>
            <button className={documentType === 'TRANSACTION' ? 'active' : ''} onClick={() => setDocumentType('TRANSACTION')}>거래내역</button>
          </div>
        </div>

        {message && <p className="notice">{message}</p>}

        <section className="file-list">
          {loading ? (
            <div className="empty-state">증빙서류를 불러오는 중입니다.</div>
          ) : filteredItems.length === 0 ? (
            <div className="empty-state">
              <strong>등록된 증빙서류가 없습니다.</strong>
              <span>사건에 필요한 서류를 추가해보세요.</span>
            </div>
          ) : (
            filteredItems.map((item) => (
              <article
                className="file-card"
                key={item.evidenceId}
                onClick={() => void openDetail(item.evidenceId)}
                onMouseEnter={(event) => void handleImageHover(item, event)}
                onMouseLeave={handleImageHoverLeave}
              >
                <div className={`file-type ${item.mimeType === 'image/png' ? 'image-type' : ''}`}>
                  {item.mimeType.startsWith('image/') ? '▧' : '▤'}
                </div>

                <div className="file-info">
                  <strong>{item.originalName}</strong>
                  <span>
                    사건 #{caseId} · 서류 #{item.evidenceId}
                    {' | '}
                    등록일: {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>

                <span className={`analysis-badge ${item.analysisStatus === 'COMPLETED' ? 'done' : ''}`}>
                  {statusLabel[item.analysisStatus] || item.analysisStatus}
                </span>

                <button
                  className="navy-button small"
                  onClick={(event) => {
                    event.stopPropagation()
                    void handleAnalyze(item.evidenceId)
                  }}
                >
                  불러오기
                </button>
              </article>
            ))
          )}
        </section>

        {hoverItem && previewCache[hoverItem.id] && (
          <div className="file-hover-preview" style={{ top: hoverItem.top, left: hoverItem.left }}>
            <img src={previewCache[hoverItem.id]} alt="서류 미리보기" />
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={page === 0} onClick={() => setPage(page - 1)}>‹</button>
            <b>{page + 1}</b>
            <button disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>›</button>
          </div>
        )}
      </main>

      <SiteFooter />

      {detail && (
        <div className="modal-backdrop" onClick={() => setDetail(null)}>
          <section className="detail-modal evidence-detail" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setDetail(null)}>×</button>

            <h2>내 증빙 서류</h2>
            <p className="modal-subtitle">분석 결과를 확인하고 진정서에 반영해보세요.</p>

            <dl className="ed-meta">
              <div><dt>사건 번호</dt><dd>#{caseId}</dd></div>
              <div><dt>서류 번호</dt><dd>#{detail.evidenceId}</dd></div>
              <div>
                <dt>분석 상태</dt>
                <dd>
                  <span className={`analysis-badge ${detail.analysisStatus === 'COMPLETED' ? 'done' : ''}`}>
                    {statusLabel[detail.analysisStatus] || detail.analysisStatus}
                  </span>
                </dd>
              </div>
              <div><dt>등록일</dt><dd>{new Date(detail.createdAt).toLocaleDateString('ko-KR')}</dd></div>
            </dl>

            <h3>{detail.originalName}</h3>
            {detail.description && <p className="ed-description">{detail.description}</p>}

            {detail.fileUrl && <img className="evidence-preview" src={detail.fileUrl} alt={detail.originalName} />}

            <div className="detail-copy">
              <strong>추출 텍스트</strong>
              <p>{detail.extractedText || '아직 분석 결과가 없습니다.'}</p>
            </div>

            <div className="detail-copy">
              <strong>AI 분석 결과</strong>
              {analysisResultText ? (
                <pre className="ed-analysis">{analysisResultText}</pre>
              ) : (
                <p>아직 AI 분석 결과가 없습니다. 목록에서 '불러오기'로 분석을 요청해보세요.</p>
              )}
            </div>

            <button className="danger-button" onClick={() => void handleDelete(detail.evidenceId)}>삭제하기</button>
          </section>
        </div>
      )}
    </div>
  )
}