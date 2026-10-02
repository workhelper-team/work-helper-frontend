import { useCallback, useEffect, useRef, useState } from 'react'

import { getExpertQuestionDetail, getExpertQuestions, submitExpertAnswer } from '@/features/expert/api/expertApi'
import { ExpertAnswerDialog } from '@/features/expert/components/ExpertAnswerDialog'
import type { ExpertQuestionDetailResponse, ExpertQuestionListPage } from '@/features/expert/types/expertQuestion'
import { ProtectedPageLayout } from '@/shared/components/layout/ProtectedPageLayout'

type StatusFilter = 'ALL' | 'WAITING' | 'ANSWERED'

const statusLabel = { WAITING: '답변 대기', ANSWERED: '답변 완료' }

export function ExpertQuestionsPage() {
  const [status, setStatus] = useState<StatusFilter>('ALL')
  const [page, setPage] = useState(0)
  const [query, setQuery] = useState('')
  const [questions, setQuestions] = useState<ExpertQuestionListPage | null>(null)
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [detail, setDetail] = useState<ExpertQuestionDetailResponse | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [answerError, setAnswerError] = useState('')
  const [answerMessage, setAnswerMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const listRequestId = useRef(0)

  const loadQuestions = useCallback(async (): Promise<boolean> => {
    const requestId = ++listRequestId.current
    setListLoading(true)
    setListError('')
    try {
      const result = await getExpertQuestions(status === 'ALL' ? undefined : status, page)
      if (requestId === listRequestId.current) setQuestions(result)
      return requestId === listRequestId.current
    } catch {
      if (requestId === listRequestId.current) setListError('질문 목록을 불러오지 못했습니다. 다시 시도해 주세요.')
      return false
    } finally {
      if (requestId === listRequestId.current) setListLoading(false)
    }
  }, [status, page])

  useEffect(() => {
    void loadQuestions()
    return () => { listRequestId.current += 1 }
  }, [loadQuestions])

  async function openQuestion(questionId: number) {
    if (detailLoading) return
    setDetailLoading(true)
    setDetailError('')
    setAnswerError('')
    setAnswerMessage('')
    try {
      setDetail(await getExpertQuestionDetail(questionId))
    } catch {
      setDetailError('질문 상세를 불러오지 못했습니다. 다시 시도해 주세요.')
    } finally {
      setDetailLoading(false)
    }
  }

  async function handleAnswer(content: string): Promise<boolean> {
    if (!detail || submitting) return false
    setSubmitting(true)
    setAnswerError('')
    setAnswerMessage('')
    try {
      await submitExpertAnswer(detail.questionId, { content })
    } catch {
      setAnswerError('답변 등록에 실패했습니다. 이미 이 질문에 답변했거나 전문가 승인 상태가 유효하지 않을 수 있습니다.')
      setSubmitting(false)
      return false
    }

    let detailRefreshed = true
    try {
      setDetail(await getExpertQuestionDetail(detail.questionId))
    } catch {
      detailRefreshed = false
    }
    const listRefreshed = await loadQuestions()
    setAnswerMessage(detailRefreshed && listRefreshed
      ? '답변이 등록되었습니다.'
      : '답변은 등록되었지만 최신 질문 정보를 모두 불러오지 못했습니다. 다시 조회해 주세요.')
    setSubmitting(false)
    return true
  }

  const visibleQuestions = questions?.content.filter((item) => item.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())) ?? []

  return (
    <ProtectedPageLayout
      title="전문가 질문"
      description="등록된 노동 상담 질문을 확인하고 전문가 답변을 남길 수 있습니다."
      backTo="/"
      backLabel="홈으로"
    >
      <div className="space-y-6">
        <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="expert-question-list-title">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 id="expert-question-list-title" className="text-lg font-bold text-slate-900">질문 목록</h2>
              <p className="mt-1 text-sm text-slate-600">승인된 전문가가 답변할 수 있는 질문입니다.</p>
            </div>
            {questions && !listLoading && !listError && <span className="text-sm text-slate-500">전체 {questions.totalElements}건</span>}
          </div>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
            <div className="flex flex-wrap gap-2" role="group" aria-label="질문 상태 필터">
              {([
                ['ALL', '전체'],
                ['WAITING', '답변 대기'],
                ['ANSWERED', '답변 완료'],
              ] as const).map(([value, label]) => (
                <button key={value} type="button" aria-pressed={status === value} onClick={() => { setStatus(value); setPage(0) }}
                  className={status === value
                    ? 'rounded-md border border-[#0b326b] bg-[#0b326b] px-4 py-2 text-sm font-semibold text-white'
                    : 'rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'}>
                  {label}
                </button>
              ))}
            </div>
            <label className="grid gap-1 text-xs font-medium text-slate-600" htmlFor="expert-question-search">
              현재 페이지 제목 검색
              <input id="expert-question-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)}
                placeholder="현재 페이지에서 검색" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none sm:w-64" />
            </label>
          </div>

          {listLoading ? (
            <div className="py-12 text-center text-sm text-slate-600" role="status">질문 목록을 불러오는 중...</div>
          ) : listError ? (
            <div className="mt-5 rounded-md border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700" role="alert">
              {listError}
              <button type="button" onClick={() => void loadQuestions()} className="ml-3 font-semibold underline">다시 조회</button>
            </div>
          ) : visibleQuestions.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-600">
              {query.trim() ? '현재 페이지에서 검색 결과가 없습니다.' : '표시할 질문이 없습니다.'}
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {visibleQuestions.map((item) => (
                <li key={item.questionId}>
                  <button type="button" onClick={() => void openQuestion(item.questionId)} disabled={detailLoading}
                    className="flex w-full flex-wrap items-center justify-between gap-4 py-5 text-left hover:bg-blue-50/40 disabled:opacity-60">
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs text-slate-500">질문 #{item.questionId} · 사건 #{item.caseId} · {item.category ?? '유형 미지정'}</span>
                      <strong className="mt-2 block break-words text-sm text-slate-900">{item.title}</strong>
                      <span className="mt-2 block text-xs text-slate-500">작성일 {new Date(item.createdAt).toLocaleDateString('ko-KR')} · 답변 {item.answerCount}건</span>
                    </span>
                    <span className={item.status === 'ANSWERED'
                      ? 'rounded bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700'
                      : 'rounded bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700'}>
                      {statusLabel[item.status] ?? item.status}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {questions && !listLoading && !listError && questions.totalPages > 1 && (
            <nav className="mt-5 flex items-center justify-center gap-4 border-t border-slate-200 pt-5 text-sm" aria-label="질문 목록 페이지">
              <button type="button" disabled={page === 0} onClick={() => setPage((current) => current - 1)} className="rounded-md border border-slate-300 px-3 py-2 text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">이전</button>
              <span className="text-slate-600">{questions.page + 1} / {questions.totalPages}</span>
              <button type="button" disabled={questions.last} onClick={() => setPage((current) => current + 1)} className="rounded-md border border-slate-300 px-3 py-2 text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">다음</button>
            </nav>
          )}
        </section>

        {detailLoading && <p className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600" role="status">질문 상세를 불러오는 중...</p>}
        {detailError && <p className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert">{detailError}</p>}
      </div>

      {detail && <ExpertAnswerDialog key={detail.questionId} detail={detail} submitting={submitting} error={answerError} message={answerMessage}
        onClose={() => setDetail(null)} onSubmit={handleAnswer} />}
    </ProtectedPageLayout>
  )
}
