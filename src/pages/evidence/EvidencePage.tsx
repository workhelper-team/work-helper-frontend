import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EvidenceDetailModal } from '@/features/evidence/components/EvidenceDetailModal'
import { EvidenceList } from '@/features/evidence/components/EvidenceList'
import { EvidenceUploadForm } from '@/features/evidence/components/EvidenceUploadForm'
import { analyzeEvidence, deleteEvidence, getEvidenceDetail, getEvidences, updateEvidence, uploadEvidence } from '@/features/evidence/api/evidenceApi'
import type { EvidenceDetail, EvidenceSummary } from '@/features/evidence/types/evidence'

function SiteHeader({ caseId }: { caseId: string | null }) {
  return <><div className="utility-bar"><span>대한민국 근로자를 위한 고용·노동 법률 서비스 플랫폼</span></div><header className="site-header"><Link className="site-brand" to="/"><b>W</b><strong>WorkHelper</strong></Link><nav><Link to={caseId ? `/cases/${caseId}/consultation` : '/cases'}>AI 상담</Link><Link to={caseId ? `/cases/${caseId}/evidences` : '/cases'}>서류 분석/OCR</Link><Link to={caseId ? `/cases/${caseId}/documents` : '/cases'}>진정서 작성</Link><Link to="/cases">내 사건 관리</Link><Link to={caseId ? `/cases/${caseId}/expert-qna` : '/cases'}>전문가 Q&amp;A</Link></nav></header></>
}

function SiteFooter() {
  return <footer className="site-footer"><div className="footer-inner"><div><div className="footer-links"><strong>이용약관</strong><a href="#privacy">개인정보처리방침</a><a href="#email">이메일무단수집거부</a><a href="#sitemap">찾아오시는 길</a></div><p>(우) 04520 서울특별시 중구 청계천로 8 고용노동복지센터 / 대표번호 1544-0000<br />상담가능시간 평일 09시 ~ 오후 6시 (토요일·공휴일 휴무)<br />워크헬퍼는 법률 전문가의 공식적인 해석을 제공하지 않습니다.</p><small>Copyright © WorkHelper. All Rights Reserved.</small></div><span className="policy-mark">공공기관 정보 보안 규격 준수</span></div></footer>
}

export function EvidencePage() {
  const { caseId: routeCaseId } = useParams()
  const caseId = routeCaseId && /^[1-9]\d*$/.test(routeCaseId) && Number.isSafeInteger(Number(routeCaseId)) ? routeCaseId : null
  const [items, setItems] = useState<EvidenceSummary[]>([])
  const [detail, setDetail] = useState<EvidenceDetail | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busyEvidenceId, setBusyEvidenceId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const loadEvidence = useCallback(async () => {
    if (!caseId) { setItems([]); setLoading(false); return }
    setLoading(true)
    try {
      const result = await getEvidences(caseId, page)
      setItems(result.content ?? [])
      setTotalPages(result.totalPages ?? 0)
      setMessage('')
    } catch { setMessage('증빙서류를 불러오지 못했습니다. 백엔드 연결을 확인해주세요.') }
    finally { setLoading(false) }
  }, [caseId, page])

  useEffect(() => { void loadEvidence() }, [loadEvidence])

  async function openDetail(id: number) {
    if (!caseId) return
    try { setDetail(await getEvidenceDetail(caseId, id)) }
    catch { setMessage('상세 정보를 불러오지 못했습니다.') }
  }

  async function handleUpload(file: File, description: string) {
    if (!caseId) { setMessage('유효한 사건 정보가 없어 업로드할 수 없습니다.'); return false }
    try {
      const created = await uploadEvidence(caseId, file, description)
      setMessage('증빙서류가 등록되었습니다.')
      await loadEvidence()
      await openDetail(created.evidenceId)
      return true
    } catch { setMessage('업로드에 실패했습니다. 파일 형식과 크기를 확인해주세요.'); return false }
  }

  async function handleAnalyze(id: number) {
    if (!caseId || busyEvidenceId !== null) return
    setBusyEvidenceId(id)
    setItems((current) => current.map((item) => item.evidenceId === id ? { ...item, analysisStatus: 'PROCESSING' } : item))
    setMessage('분석 중입니다.')
    try {
      await analyzeEvidence(caseId, id)
      await loadEvidence()
      await openDetail(id)
      setMessage('분석 결과를 불러왔습니다.')
    } catch {
      await loadEvidence()
      if (detail?.evidenceId === id) await openDetail(id)
      setMessage('분석에 실패했습니다. 실패 상태를 확인한 뒤 다시 시도할 수 있습니다.')
    } finally { setBusyEvidenceId(null) }
  }

  async function handleSaveText(id: number, extractedText: string) {
    if (!caseId || saving) return
    setSaving(true)
    try {
      await updateEvidence(caseId, id, extractedText)
      await openDetail(id)
      await loadEvidence()
      setMessage('추출 텍스트를 저장했습니다.')
    } catch { setMessage('추출 텍스트 저장에 실패했습니다.') }
    finally { setSaving(false) }
  }

  async function handleDelete(id: number) {
    if (!caseId || !window.confirm('이 증빙서류를 삭제하시겠습니까?')) return
    try { await deleteEvidence(caseId, id); setDetail(null); await loadEvidence(); setMessage('증빙서류가 삭제되었습니다.') }
    catch { setMessage('삭제에 실패했습니다.') }
  }

  const processing = busyEvidenceId !== null && detail?.evidenceId === busyEvidenceId

  return <div className="site-page">
    <SiteHeader caseId={caseId} />
    <section className="page-banner"><div className="container"><p className="breadcrumb">홈 &gt; 내 사건 관리 &gt; 내 증빙 서류함</p><h1>내 증빙 서류함</h1><p>이전에 분석한 서류를 불러와 진정서에 반영해보세요.</p></div></section>
    <main className="container evidence-main">
      <div className="section-title-row"><div><h2>내 증빙 서류함</h2><p>근로계약서, 급여명세서 등 사건에 필요한 자료를 관리합니다.</p></div></div>
      {!caseId && <p className="notice">유효한 사건 ID가 없어 Evidence를 불러오거나 수정할 수 없습니다.</p>}
      <EvidenceUploadForm disabled={!caseId} onUpload={handleUpload} />
      {message && <p className="notice" role="status">{message}</p>}
      <EvidenceList items={items} loading={loading} busyEvidenceId={busyEvidenceId} page={page} totalPages={totalPages} onAnalyze={(id) => void handleAnalyze(id)} onSelect={(id) => void openDetail(id)} onPageChange={setPage} />
    </main>
    <SiteFooter />
    {detail && <EvidenceDetailModal detail={detail} processing={processing} saving={saving} onClose={() => setDetail(null)} onAnalyze={(id) => void handleAnalyze(id)} onSave={(id, text) => void handleSaveText(id, text)} onDelete={(id) => void handleDelete(id)} />}
  </div>
}
