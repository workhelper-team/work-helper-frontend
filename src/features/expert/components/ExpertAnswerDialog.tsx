import { useState, type FormEvent } from 'react'

import type { ExpertQuestionDetailResponse } from '@/features/expert/types/expertQuestion'

interface Props {
  detail: ExpertQuestionDetailResponse
  submitting: boolean
  error: string
  message: string
  onClose: () => void
  onSubmit: (content: string) => Promise<boolean>
}

const statusLabel = { WAITING: '답변 대기', ANSWERED: '답변 완료' }

export function ExpertAnswerDialog({ detail, submitting, error, message, onClose, onSubmit }: Props) {
  const [content, setContent] = useState('')
  const [validationError, setValidationError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    const trimmed = content.trim()
    if (!trimmed) {
      setValidationError('답변 내용을 입력해 주세요.')
      return
    }

    setValidationError('')
    if (await onSubmit(trimmed)) setContent('')
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4" onClick={() => { if (!submitting) onClose() }}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="expert-question-detail-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md bg-white p-6 shadow-xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-block rounded bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{statusLabel[detail.status] ?? detail.status}</span>
            <h2 id="expert-question-detail-title" className="mt-3 text-xl font-bold text-slate-900">{detail.title}</h2>
            <p className="mt-2 text-xs text-slate-500">질문 #{detail.questionId} · 사건 #{detail.caseId} · 작성일 {new Date(detail.createdAt).toLocaleDateString('ko-KR')}</p>
          </div>
          <button type="button" onClick={onClose} disabled={submitting} aria-label="질문 상세 닫기" className="text-xl text-slate-500 hover:text-slate-900 disabled:opacity-50">×</button>
        </div>

        <section className="mt-6 border-t border-slate-200 pt-5" aria-labelledby="expert-question-content-title">
          <h3 id="expert-question-content-title" className="text-sm font-bold text-slate-900">질문 내용</h3>
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{detail.content}</p>
        </section>

        <section className="mt-6 border-t border-slate-200 pt-5" aria-labelledby="expert-answer-list-title">
          <h3 id="expert-answer-list-title" className="text-sm font-bold text-slate-900">등록된 답변 ({detail.answers.length})</h3>
          {detail.answers.length === 0 ? (
            <p className="mt-3 rounded-md bg-slate-50 p-4 text-sm text-slate-600">아직 등록된 답변이 없습니다.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {detail.answers.map((answer) => (
                <article key={answer.answerId} className="rounded-md border border-blue-100 bg-blue-50/50 p-4">
                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{answer.content}</p>
                  <p className="mt-3 text-xs text-slate-500">답변 #{answer.answerId} · {new Date(answer.createdAt).toLocaleDateString('ko-KR')}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <form className="mt-6 border-t border-slate-200 pt-5" onSubmit={(event) => void handleSubmit(event)}>
          <label htmlFor="expert-answer-content" className="block text-sm font-bold text-slate-900">답변 작성</label>
          <textarea
            id="expert-answer-content"
            value={content}
            onChange={(event) => { setContent(event.target.value); setValidationError('') }}
            disabled={submitting}
            rows={6}
            className="mt-3 w-full resize-y rounded-md border border-slate-300 px-4 py-3 text-sm leading-6 focus:border-blue-700 focus:outline-none disabled:opacity-60"
            placeholder="질문에 대한 답변을 입력해 주세요."
          />
          {(validationError || error) && <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">{validationError || error}</p>}
          {message && <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700" role="status">{message}</p>}
          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={submitting} className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">닫기</button>
            <button type="submit" disabled={submitting} className="rounded-md bg-[#0b326b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50">{submitting ? '등록 중...' : '답변 등록'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}
