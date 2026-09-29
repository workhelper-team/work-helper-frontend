import { useEffect, useState } from 'react'

import {
  getAdminExpertQuestionDetail,
  getAdminExpertQuestions,
  getExpertQuestionDetail,
  getExpertQuestions,
  submitExpertAnswer,
} from '@/features/expert/api/expertApi'
import type { ExpertQuestionDetail, ExpertQuestionSummary } from '@/features/expert/types/expertQuestion'
import { ExpertQuestionDetailView } from '@/features/expert/components/ExpertQuestionDetailView'
import { SiteHeader } from '@/shared/components/layout/SiteHeader'

const statusLabel: Record<string, string> = { WAITING: '답변 대기', ANSWERED: '답변 완료' }

// mode
//  - 'expert' : 승인된 전문가. 질문 조회 + 답변 등록
//  - 'admin'  : 관리자. 전체 상담글/답변 읽기 전용 (답변 등록 불가)
export function ExpertQuestionsPage({ mode = 'expert' }: { mode?: 'expert' | 'admin' }) {
  const isAdmin = mode === 'admin'

  const [items, setItems] = useState<ExpertQuestionSummary[]>([])
  const [detail, setDetail] = useState<ExpertQuestionDetail | null>(null)
  const [answerContent, setAnswerContent] = useState('')
  const [status, setStatus] = useState('ALL')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  async function loadQuestions() {
    setLoading(true)
    try {
      const result = isAdmin ? await getAdminExpertQuestions(status) : await getExpertQuestions(status)
      setItems(result.content ?? [])
      setMessage('')
    } catch {
      setMessage(isAdmin ? '상담 목록을 불러오지 못했습니다. 관리자 권한을 확인해주세요.' : '질문 목록을 불러오지 못했습니다. 로그인 및 전문가 승인 상태를 확인해주세요.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadQuestions() }, [status])

  async function openQuestion(questionId: number) {
    try {
      setDetail(isAdmin ? await getAdminExpertQuestionDetail(questionId) : await getExpertQuestionDetail(questionId))
      setAnswerContent('')
    } catch {
      setMessage('질문 상세 내용을 불러오지 못했습니다.')
    }
  }

  async function submitAnswer() {
    if (!detail || isAdmin) return
    if (!answerContent.trim()) { setMessage('답변 내용을 입력해주세요.'); return }

    setSubmitting(true)
    try {
      await submitExpertAnswer(detail.questionId, answerContent.trim())
      setAnswerContent('')
      setMessage('답변이 등록되었습니다.')
      const refreshed = await getExpertQuestionDetail(detail.questionId)
      setDetail(refreshed)
      await loadQuestions()
    } catch {
      setMessage('답변 등록에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="site-page">
      <SiteHeader />

      <section className="page-banner">
        <div className="container">
          <p className="breadcrumb">{isAdmin ? '홈 > 관리자 > 노무사 1:1 상담 내역' : '홈 > 전문가 Q&A 답변'}</p>
          <h1>{isAdmin ? '노무사 1:1 상담 전체 내역' : '답변 대기 중인 질문'}</h1>
          <p>
            {isAdmin
              ? '전체 사용자의 상담글과 전문가 답변을 조회합니다. (읽기 전용)'
              : '회원들이 등록한 노동 상담 질문을 확인하고 답변을 등록해주세요.'}
          </p>
        </div>
      </section>

      <main className="container expert-main">
        <section className="qna-toolbar">
          <div className="filter-tabs">
            <button className={status === 'ALL' ? 'active' : ''} onClick={() => setStatus('ALL')}>전체</button>
            <button className={status === 'WAITING' ? 'active' : ''} onClick={() => setStatus('WAITING')}>답변 대기</button>
            <button className={status === 'ANSWERED' ? 'active' : ''} onClick={() => setStatus('ANSWERED')}>답변 완료</button>
          </div>
          <div className="qna-actions">
            <label className="search-input">⌕<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="질문 키워드 검색" /></label>
          </div>
        </section>

        {message && <p className="notice">{message}</p>}

        <section className="qna-list">
          {loading ? (
            <div className="empty-state">질문 목록을 불러오는 중입니다.</div>
          ) : filteredItems.length === 0 ? (
            <div className="empty-state"><strong>표시할 질문이 없습니다.</strong></div>
          ) : (
            filteredItems.map((item) => (
              <button className="qna-card" key={item.questionId} onClick={() => void openQuestion(item.questionId)}>
                <div className="qna-card-copy">
                  <div className="qna-meta">
                    <span className="source-tag">{item.category || '노동 상담'}</span>
                    <time>작성일 {new Date(item.createdAt).toLocaleDateString('ko-KR')}</time>
                  </div>
                  <strong>{item.title}</strong>
                  <p>사건 #{item.caseId} · 답변 {item.answerCount}건</p>
                </div>
                <span className={`analysis-badge ${item.status === 'ANSWERED' ? 'done' : ''}`}>
                  {statusLabel[item.status] || item.status}
                </span>
                <small>상세 보기 ›</small>
              </button>
            ))
          )}
        </section>
      </main>

      {detail && (
        <div className="modal-backdrop" onClick={() => setDetail(null)}>
          <section className="detail-modal qna-detail" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setDetail(null)}>×</button>
            <ExpertQuestionDetailView detail={detail} />

            {!isAdmin && (
            <>
            <label className="answer-compose">
              답변 작성
              <textarea
                value={answerContent}
                onChange={(event) => setAnswerContent(event.target.value)}
                placeholder="관련 법령과 근거를 포함해 답변을 작성해주세요."
                rows={6}
              />
            </label>
            <div className="form-actions">
              <button className="outline-button" onClick={() => setDetail(null)}>닫기</button>
              <button className="navy-button" disabled={submitting} onClick={() => void submitAnswer()}>
                {submitting ? '등록 중...' : '답변 등록하기'}
              </button>
            </div>
            </>
            )}
            {isAdmin && (
              <div className="form-actions">
                <button className="outline-button" onClick={() => setDetail(null)}>닫기</button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
