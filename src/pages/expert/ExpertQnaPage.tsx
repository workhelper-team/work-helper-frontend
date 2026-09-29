import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { createQuestion, getMyQuestionDetail, getMyQuestions } from '@/features/expert/api/expertApi'
import { ExpertQuestionDetailModal } from '@/features/expert/components/ExpertQuestionDetailModal'
import { ExpertQuestionForm } from '@/features/expert/components/ExpertQuestionForm'
import type { ExpertQuestionDetail, ExpertQuestionSummary } from '@/features/expert/types/expertQuestion'

const statusLabel: Record<string, string> = { WAITING: '답변 대기', ANSWERED: '답변 완료' }

function isValidCaseId(value: string | undefined): value is string {
  return Boolean(value && /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value)))
}

function SiteHeader({ caseId }: { caseId: string | null }) {
  return <header className="site-header"><Link className="site-brand" to="/"><b>W</b><strong>WorkHelper</strong></Link><nav><Link to={caseId ? `/cases/${caseId}/consultation` : '/cases'}>AI 상담</Link><Link to={caseId ? `/cases/${caseId}/evidences` : '/cases'}>서류 분석/OCR</Link><Link to={caseId ? `/cases/${caseId}/documents` : '/cases'}>진정서 작성</Link><Link to="/cases">내 사건 관리</Link><Link className="current-nav" to={caseId ? `/cases/${caseId}/expert-qna` : '/cases'}>전문가 Q&amp;A</Link></nav></header>
}

export function ExpertQnaPage() {
  const { caseId: routeCaseId } = useParams()
  const caseId = isValidCaseId(routeCaseId) ? routeCaseId : null
  const [items, setItems] = useState<ExpertQuestionSummary[]>([])
  const [detail, setDetail] = useState<ExpertQuestionDetail | null>(null)
  const [status, setStatus] = useState('ALL')
  const [query, setQuery] = useState('')
  const [composeOpen, setComposeOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const loadQuestions = useCallback(async () => {
    if (!caseId) { setLoading(false); setItems([]); return }
    setLoading(true)
    try {
      const result = await getMyQuestions(caseId)
      setItems(result.content ?? [])
      setMessage('')
    } catch {
      setMessage('전문가 Q&A를 이용하려면 로그인과 사건 정보가 필요합니다.')
    } finally {
      setLoading(false)
    }
  }, [caseId])

  useEffect(() => { void loadQuestions() }, [loadQuestions])

  async function submitQuestion(title: string, content: string) {
    if (!caseId) return
    try {
      await createQuestion(caseId, { title, content })
      setComposeOpen(false)
      setMessage('질문이 등록되었습니다.')
      await loadQuestions()
    } catch {
      setMessage('질문 등록에 실패했습니다. 로그인과 사건 권한을 확인해주세요.')
    }
  }

  async function openQuestion(questionId: number) {
    if (!caseId) return
    try { setDetail(await getMyQuestionDetail(caseId, questionId)) }
    catch { setMessage('질문 상세 내용을 불러오지 못했습니다.') }
  }

  const filteredItems = items.filter((item) => {
    const matchesStatus = status === 'ALL' || item.status === status
    return matchesStatus && item.title.toLowerCase().includes(query.toLowerCase())
  })

  if (!caseId) return <div className="site-page"><SiteHeader caseId={null} /><main className="container"><p>잘못된 사건 경로입니다.</p><Link to="/cases">사건 목록으로</Link></main></div>

  return <div className="site-page"><SiteHeader caseId={caseId} /><section className="page-banner"><div className="container"><p className="breadcrumb">홈 &gt; 전문가 Q&amp;A</p><h1>전문가 Q&amp;A</h1><p>노동 문제에 대해 전문가에게 질문하고 답변을 확인해보세요.</p></div></section><main className="container expert-main"><section className="qna-toolbar"><div className="filter-tabs"><button className={status === 'ALL' ? 'active' : ''} onClick={() => setStatus('ALL')}>전체 ({items.length})</button><button className={status === 'ANSWERED' ? 'active' : ''} onClick={() => setStatus('ANSWERED')}>답변 완료 ({items.filter((item) => item.status === 'ANSWERED').length})</button><button className={status === 'WAITING' ? 'active' : ''} onClick={() => setStatus('WAITING')}>답변 대기 ({items.filter((item) => item.status === 'WAITING').length})</button></div><div className="qna-actions"><label className="search-input">⌕<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="질문 키워드 검색" /></label><button className="navy-button" onClick={() => setComposeOpen(true)}>＋ 질문 등록하기</button></div></section>{message && <p className="notice">{message}</p>}<section className="qna-list">{loading ? <div className="empty-state">질문 목록을 불러오는 중입니다.</div> : filteredItems.length === 0 ? <div className="empty-state"><strong>표시할 질문이 없습니다.</strong><span>검색 조건을 바꾸거나 새 질문을 등록해보세요.</span></div> : filteredItems.map((item) => <button className="qna-card" key={item.questionId} onClick={() => void openQuestion(item.questionId)}><div className="qna-card-copy"><div className="qna-meta"><span className="source-tag">{item.category || '노동 상담'}</span><time>작성일 {new Date(item.createdAt).toLocaleDateString('ko-KR')}</time></div><strong>{item.title}</strong><p>전문가 답변 {item.answerCount}건이 등록된 질문입니다.</p></div><span className={`analysis-badge ${item.status === 'ANSWERED' ? 'done' : ''}`}>{statusLabel[item.status] || item.status}</span><small>상세 보기 ›</small></button>)}</section></main>{composeOpen && <ExpertQuestionForm onClose={() => setComposeOpen(false)} onSubmit={submitQuestion} />}{detail && <ExpertQuestionDetailModal detail={detail} onClose={() => setDetail(null)} />}</div>
}
