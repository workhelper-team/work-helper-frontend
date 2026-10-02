import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { createQuestion, getMyQuestionDetail, getMyQuestions } from '@/features/expert/api/expertApi'
import { ExpertQuestionDetailModal } from '@/features/expert/components/ExpertQuestionDetailModal'
import { ExpertQuestionForm } from '@/features/expert/components/ExpertQuestionForm'
import type { ExpertQuestionDetail, ExpertQuestionSummary } from '@/features/expert/types/expertQuestion'
import { ProtectedPageLayout } from '@/shared/components/layout/ProtectedPageLayout'

const statusLabel: Record<string, string> = { WAITING: '답변 대기', ANSWERED: '답변 완료' }

function isValidCaseId(value: string | undefined): value is string {
  return Boolean(value && /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value)))
}

export function ExpertQnaPage() {
  const { caseId: routeCaseId } = useParams()
  const caseId = isValidCaseId(routeCaseId) ? routeCaseId : null
  const [items, setItems] = useState<ExpertQuestionSummary[]>([])
  const [detail, setDetail] = useState<ExpertQuestionDetail | null>(null)
  const [status, setStatus] = useState('ALL')
  const [query, setQuery] = useState('')
  const [composeOpen, setComposeOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const submitPending = useRef(false)
  const listRequestId = useRef(0)
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [message, setMessage] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [last, setLast] = useState(true)

  const loadQuestions = useCallback(async () => {
    const requestId = ++listRequestId.current
    if (!caseId) { setLoading(false); setItems([]); return }
    setLoading(true)
    setListError('')
    try {
      const result = await getMyQuestions(caseId, page)
      if (requestId !== listRequestId.current) return
      setItems(result.content)
      setTotalPages(result.totalPages)
      setTotalElements(result.totalElements)
      setLast(result.last)
    } catch {
      if (requestId !== listRequestId.current) return
      setItems([])
      setListError('질문 목록을 불러오지 못했습니다. 로그인과 사건 권한을 확인해주세요.')
    } finally {
      if (requestId === listRequestId.current) setLoading(false)
    }
  }, [caseId, page])

  useEffect(() => { void loadQuestions() }, [loadQuestions])

  async function submitQuestion(title: string, content: string) {
    if (!caseId || submitPending.current) return
    submitPending.current = true
    setSubmitting(true)
    setFormError('')
    try {
      await createQuestion(caseId, { title, content })
    } catch {
      setFormError('질문 등록에 실패했습니다. 로그인과 사건 권한을 확인해주세요.')
      return
    } finally {
      submitPending.current = false
      setSubmitting(false)
    }
    setComposeOpen(false)
    setMessage('질문이 등록되었습니다.')
    if (page === 0) void loadQuestions()
    else setPage(0)
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

  if (!caseId) return <ProtectedPageLayout title="전문가 Q&A" description="노동 문제에 대해 전문가에게 질문하고 답변을 확인해보세요." backTo="/cases" backLabel="내 사건으로"><p>잘못된 사건 경로입니다.</p></ProtectedPageLayout>

  return (
    <ProtectedPageLayout title="전문가 Q&A" description="노동 문제에 대해 전문가에게 질문하고 답변을 확인해보세요." backTo={`/cases/${caseId}`} backLabel="사건 상세로">
      <div>
        <section className="qna-toolbar">
          <div className="filter-tabs">
            <button className={status === 'ALL' ? 'active' : ''} onClick={() => setStatus('ALL')}>전체</button>
            <button className={status === 'ANSWERED' ? 'active' : ''} onClick={() => setStatus('ANSWERED')}>답변 완료</button>
            <button className={status === 'WAITING' ? 'active' : ''} onClick={() => setStatus('WAITING')}>답변 대기</button>
          </div>
          <div className="qna-actions">
            <label className="search-input">⌕<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="현재 페이지에서 제목 검색" aria-label="현재 페이지에서 질문 제목 검색" /></label>
            <button className="navy-button" onClick={() => { setFormError(''); setComposeOpen(true) }}>＋ 질문 등록하기</button>
          </div>
        </section>
        {message && <p className="notice" role="status">{message}</p>}
        {!loading && !listError && <p>전체 질문 {totalElements}건 · 답변 상태와 제목 검색은 현재 페이지에만 적용됩니다.</p>}
        <section className="qna-list">
          {loading ? <div className="empty-state">질문 목록을 불러오는 중입니다.</div>
            : listError ? <div className="empty-state" role="alert">{listError}</div>
              : filteredItems.length === 0 ? <div className="empty-state"><strong>표시할 질문이 없습니다.</strong><span>현재 페이지의 검색 조건을 바꾸거나 새 질문을 등록해보세요.</span></div>
                : filteredItems.map((item) => <button className="qna-card" key={item.questionId} onClick={() => void openQuestion(item.questionId)}><div className="qna-card-copy"><div className="qna-meta"><span className="source-tag">{item.category || '노동 상담'}</span><time>작성일 {new Date(item.createdAt).toLocaleDateString('ko-KR')}</time></div><strong>{item.title}</strong><p>전문가 답변 {item.answerCount}건이 등록된 질문입니다.</p></div><span className={`analysis-badge ${item.status === 'ANSWERED' ? 'done' : ''}`}>{statusLabel[item.status] || item.status}</span><small>상세 보기 ›</small></button>)}
        </section>
        {!loading && !listError && totalPages > 1 && <nav className="form-actions" aria-label="질문 목록 페이지"><button type="button" className="outline-button" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>이전</button><span>{page + 1} / {totalPages} 페이지</span><button type="button" className="outline-button" disabled={last || page + 1 >= totalPages} onClick={() => setPage((current) => current + 1)}>다음</button></nav>}
      </div>
      {composeOpen && <ExpertQuestionForm onClose={() => setComposeOpen(false)} onSubmit={submitQuestion} submitting={submitting} error={formError} />}
      {detail && <ExpertQuestionDetailModal detail={detail} onClose={() => setDetail(null)} />}
    </ProtectedPageLayout>
  )
}
