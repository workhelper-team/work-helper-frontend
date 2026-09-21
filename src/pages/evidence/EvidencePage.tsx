import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { analyzeEvidence, deleteEvidence, getEvidenceDetail, getEvidences, uploadEvidence } from '@/features/evidence/api/evidenceApi'
import type { EvidenceDetail, EvidenceSummary } from '@/features/evidence/types/evidence'

const statusLabel: Record<string, string> = { PENDING: '분석 대기', PROCESSING: '분석 중', COMPLETED: '분석완료', FAILED: '분석 실패' }

function SiteHeader() {
  return <><div className="utility-bar"><span>대한민국 근로자를 위한 고용·노동 법률 서비스 플랫폼</span><span>로그인　|　회원가입　|　고객센터</span></div><header className="site-header"><Link className="site-brand" to="/"><b>W</b><strong>WorkHelper</strong></Link><nav><Link to="/legal-documents">AI 법률상담</Link><Link to="/cases/1/evidences">서류 분석/OCR</Link><span>진정서 작성</span><span>내 사건 관리</span><Link to="/expert-qna">전문가 Q&amp;A</Link></nav><button className="all-menu">▣　전체메뉴</button></header></>
}

function SiteFooter() {
  return <footer className="site-footer"><div className="footer-inner"><div><div className="footer-links"><strong>이용약관</strong><a href="#privacy">개인정보처리방침</a><a href="#email">이메일무단수집거부</a><a href="#sitemap">찾아오시는 길</a></div><p>(우) 04520 서울특별시 중구 청계천로 8 고용노동복지센터　/ 대표번호: 1544-0000<br />상담가능시간: 평일 09시 ~ 오후 6시 (토/일요일, 공휴일 휴무)<br />워크헬퍼는 법률 전문가의 공식적인 의견을 대신하지 않습니다.</p><small>Copyright © WorkHelper. All Rights Reserved.</small></div><span className="policy-mark">●　공공 정보 보안 규격 준수</span></div></footer>
}

export function EvidencePage() {
  const { caseId = '1' } = useParams()
  const [items, setItems] = useState<EvidenceSummary[]>([])
  const [detail, setDetail] = useState<EvidenceDetail | null>(null)
  const [query, setQuery] = useState('')
  const [documentType, setDocumentType] = useState('ALL')
  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!selectedFile) return
    if (!['image/jpeg', 'image/png'].includes(selectedFile.type)) {
      setSelectedFile(null)
      setMessage('JPEG 또는 PNG 파일만 선택할 수 있습니다.')
    } else if (selectedFile.size > 10 * 1024 * 1024) {
      setSelectedFile(null)
      setMessage('파일 크기는 10MB 이하만 선택할 수 있습니다.')
    }
  }, [selectedFile])

  useEffect(() => {
    const uploadNote = document.querySelector('.upload-note')
    if (!uploadNote) return
    const existingPreview = uploadNote.querySelector('.upload-preview')
    existingPreview?.remove()
    if (!selectedFile) return
    const url = URL.createObjectURL(selectedFile)
    const preview = document.createElement('img')
    preview.className = 'upload-preview'
    preview.src = url
    preview.alt = `${selectedFile.name} 미리보기`
    uploadNote.prepend(preview)
    return () => {
      preview.remove()
      URL.revokeObjectURL(url)
    }
  }, [selectedFile])

  async function loadEvidence() {
    setLoading(true)
    try { const result = await getEvidences(caseId, page); setItems(result.content ?? []); setTotalPages(result.totalPages ?? 0); setMessage('') }
    catch { setMessage('증빙서류를 불러오지 못했습니다. 백엔드 연결을 확인해주세요.') }
    finally { setLoading(false) }
  }
  useEffect(() => { void loadEvidence() }, [caseId, page])

  async function handleUpload() {
    const file = selectedFile
    if (!file) return setMessage('업로드할 JPEG 또는 PNG 파일을 선택해주세요.')
    try { await uploadEvidence(caseId, file, description); setDescription(''); setSelectedFile(null); if (fileRef.current) fileRef.current.value = ''; setMessage('증빙서류가 등록되었습니다.'); await loadEvidence() }
    catch { setMessage('업로드에 실패했습니다. JPEG 또는 PNG 파일인지 확인해주세요.') }
  }
  async function openDetail(id: number) { try { setDetail(await getEvidenceDetail(caseId, id)) } catch { setMessage('상세 정보를 불러오지 못했습니다.') } }
  async function handleAnalyze(id: number) { try { await analyzeEvidence(caseId, id); await loadEvidence(); setMessage('분석 요청을 전송했습니다.') } catch { setMessage('분석 요청에 실패했습니다.') } }
  async function handleDelete(id: number) { if (!window.confirm('이 증빙서류를 삭제하시겠습니까?')) return; try { await deleteEvidence(caseId, id); setDetail(null); await loadEvidence(); setMessage('증빙서류가 삭제되었습니다.') } catch { setMessage('삭제에 실패했습니다.') } }

  const typeKeywords: Record<string, string[]> = { CONTRACT: ['근로계약서', '계약서'], PAYSLIP: ['급여명세서', '급여', '월급'], TRANSACTION: ['거래내역', '거래', '입출금'] }
  const filteredItems = items.filter((item) => {
    const searchableText = `${item.originalName} ${item.description || ''}`.toLowerCase()
    const matchesQuery = searchableText.includes(query.toLowerCase())
    const matchesType = documentType === 'ALL' || typeKeywords[documentType].some((keyword) => searchableText.includes(keyword))
    return matchesQuery && matchesType
  })
  return <div className="site-page"><SiteHeader /><section className="page-banner"><div className="container"><p className="breadcrumb">홈　&gt;　내 사건 관리　&gt;　내 증빙 서류함</p><h1>내 증빙 서류함</h1><p>이전에 분석한 서류를 불러와 진정서에 반영해보세요.</p></div></section><main className="container evidence-main"><div className="section-title-row"><div><h2>내 증빙 서류함</h2><p>근로계약서, 급여명세서 등 사건에 필요한 자료를 관리합니다.</p></div><label className="outline-button upload-label"><input ref={fileRef} type="file" accept="image/jpeg,image/png" onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} />＋ 서류 추가</label></div><div className="file-toolbar"><label className="search-input">⌕<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="파일명 검색" /></label><div className="filter-tabs"><button className={documentType === 'ALL' ? 'active' : ''} onClick={() => setDocumentType('ALL')}>전체</button><button className={documentType === 'CONTRACT' ? 'active' : ''} onClick={() => setDocumentType('CONTRACT')}>근로계약서</button><button className={documentType === 'PAYSLIP' ? 'active' : ''} onClick={() => setDocumentType('PAYSLIP')}>급여명세서</button><button className={documentType === 'TRANSACTION' ? 'active' : ''} onClick={() => setDocumentType('TRANSACTION')}>거래내역</button></div></div><div className="upload-note"><span>{selectedFile ? `선택 파일: ${selectedFile.name}` : '먼저 서류를 추가해주세요.'}</span><input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="자료 설명을 입력해주세요" /><button className="navy-button" onClick={() => void handleUpload()}>업로드</button></div>{message && <p className="notice">{message}</p>}<section className="file-list">{loading ? <div className="empty-state">증빙서류를 불러오는 중입니다.</div> : filteredItems.length === 0 ? <div className="empty-state"><strong>등록된 증빙서류가 없습니다.</strong><span>사건에 필요한 서류를 추가해보세요.</span></div> : filteredItems.map((item) => <article className="file-card" key={item.evidenceId} onClick={() => void openDetail(item.evidenceId)}><div className={`file-type ${item.mimeType === 'image/png' ? 'image-type' : ''}`}>{item.mimeType.startsWith('image/') ? '▧' : '▤'}</div><div className="file-info"><strong>{item.originalName}</strong><span>유형: {item.mimeType === 'image/png' ? '이미지' : '증빙자료'}　|　등록일: {new Date(item.createdAt).toLocaleDateString('ko-KR')}</span></div><span className={`analysis-badge ${item.analysisStatus === 'COMPLETED' ? 'done' : ''}`}>{statusLabel[item.analysisStatus] || item.analysisStatus}</span><button className="navy-button small" onClick={(event) => { event.stopPropagation(); void handleAnalyze(item.evidenceId) }}>불러오기</button></article>)}</section>{totalPages > 1 && <div className="pagination"><button disabled={page === 0} onClick={() => setPage(page - 1)}>‹</button><b>{page + 1}</b><span>2</span><span>3</span><button disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>›</button></div>}</main><SiteFooter />{detail && <div className="modal-backdrop" onClick={() => setDetail(null)}><section className="detail-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setDetail(null)}>×</button><h2>내 증빙 서류</h2><p className="modal-subtitle">분석 결과를 확인하고 진정서에 반영해보세요.</p><h3>{detail.originalName}</h3>{detail.fileUrl && <img className="evidence-preview" src={detail.fileUrl} alt={detail.originalName} />}<div className="detail-copy"><strong>추출 텍스트</strong><p>{detail.extractedText || '아직 분석 결과가 없습니다.'}</p></div><button className="danger-button" onClick={() => void handleDelete(detail.evidenceId)}>삭제하기</button></section></div>}</div>
}
