// ==========================================================
// 상담 채팅 컴포넌트
//
// 특정 사건의 상담 메시지를 불러오고
// 사용자가 새로운 상담 메시지를 입력해서 전송할 수 있다.
// ==========================================================

import { useCallback, useEffect, useRef, useState } from 'react'

import {
  getConsultationMessages,
  sendConsultationMessage,
} from '../api/consultationApi'

import type { ConsultationMessage } from '../types/consultation'

interface ConsultationChatProps {
  caseId: number
  initialQuestion?: string
  onInitialQuestionConsumed?: () => void
}

export function ConsultationChat({
  caseId,
  initialQuestion,
  onInitialQuestionConsumed,
}: ConsultationChatProps) {
  // 상담 메시지 목록
  const [messages, setMessages] = useState<ConsultationMessage[]>([])

  // 사용자가 입력 중인 내용
  const [content, setContent] = useState('')

  // 메시지 조회 로딩 상태
  const [loading, setLoading] = useState(true)

  // 메시지 전송 상태
  const [sending, setSending] = useState(false)

  // 에러 메시지
  const [error, setError] = useState<string | null>(null)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)
  const sendPending = useRef(false)
  const initialQuestionConsumed = useRef(false)
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  // 사건의 상담 메시지 조회
  useEffect(() => {
    let cancelled = false
    async function loadMessages() {
      try {
        setError(null)
        setLoading(true)

        const response = await getConsultationMessages(caseId)

        if (!cancelled) setMessages(response)
      } catch (err) {
        console.error(err)

        if (!cancelled) setError('상담 내용을 불러오지 못했습니다.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadMessages()
    return () => { cancelled = true }
  }, [caseId])

  // 수동 전송과 첫 질문 자동 전송 모두 같은 POST → GET 흐름을 사용한다.
  const sendMessage = useCallback(async (messageContent: string) => {
    if (!messageContent || sendPending.current) return
    sendPending.current = true
    setSending(true)
    setError(null)
    setPendingMessage(messageContent)
    setContent('')
    let postSucceeded = false
    try {
      await sendConsultationMessage(caseId, { content: messageContent })
      postSucceeded = true
    } catch (err) {
      console.error(err)
      if (mounted.current) setError('AI 응답을 받지 못했습니다. 질문이 이미 저장되었을 수 있어 자동으로 재전송하지 않습니다.')
    }

    // AI 실패 시에도 USER 메시지가 저장되었을 수 있으므로 서버 상태를 확인한다.
    try {
      const latestMessages = await getConsultationMessages(caseId)
      if (mounted.current) {
        setMessages(latestMessages)
        setPendingMessage(null)
      }
    } catch (err) {
      console.error(err)
      if (mounted.current) setError(postSucceeded
        ? '메시지 전송은 완료됐지만 상담 내역을 불러오지 못했습니다. 페이지를 다시 열어 확인해주세요.'
        : 'AI 요청과 상담 내역 조회에 실패했습니다. 질문 저장 여부를 확인할 수 없어 자동으로 재전송하지 않습니다.')
    } finally {
      sendPending.current = false
      if (mounted.current) setSending(false)
    }
  }, [caseId])

  useEffect(() => {
    if (loading || !initialQuestion || initialQuestionConsumed.current) return
    initialQuestionConsumed.current = true
    onInitialQuestionConsumed?.()
    void sendMessage(initialQuestion)
  }, [loading, initialQuestion, onInitialQuestionConsumed, sendMessage])

  function handleSendMessage() {
    void sendMessage(content.trim())
  }

  // 로딩 중
  if (loading) {
    return <div className="rounded-md border border-slate-200 bg-white px-6 py-14 text-center text-sm text-slate-600" role="status">상담 내용을 불러오는 중...</div>
  }

  return (
    <section className="mx-auto max-w-4xl overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm" aria-label="사건 상담">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-7">
        <h2 className="text-base font-bold text-slate-900">상담 대화</h2>
        <p className="mt-1 text-xs text-slate-500">이 사건의 상담 내용이 시간 순서대로 표시됩니다.</p>
      </div>

      {error && <p className="mx-5 mt-5 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 sm:mx-7" role="alert">{error}</p>}

      <div className="max-h-[560px] min-h-[320px] space-y-5 overflow-y-auto bg-slate-50/50 px-5 py-7 sm:px-7" aria-label="상담 메시지 목록">
        {messages.length === 0 && !pendingMessage ? (
          !error && <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
            <p className="font-semibold text-slate-800">아직 상담 내용이 없습니다.</p>
            <p className="mt-2 text-sm text-slate-500">아래에 상담 내용을 입력해 대화를 시작하세요.</p>
          </div>
        ) : (
          messages.map((message) => (
            <article key={message.messageId} className={`flex ${message.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-md border px-4 py-3 sm:max-w-[75%] ${message.role === 'USER' ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                <strong className={`text-xs ${message.role === 'USER' ? 'text-blue-800' : 'text-slate-700'}`}>
                  {message.role === 'USER' ? '나' : '상담 AI'}
                </strong>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">{message.content}</p>
                <small className="mt-2 block text-xs text-slate-500">{message.createdAt}</small>
              </div>
            </article>
          ))
        )}
        {pendingMessage && (
          <article className="flex justify-end">
            <div className="max-w-[85%] rounded-md border border-blue-200 bg-blue-50 px-4 py-3 sm:max-w-[75%]">
              <strong className="text-xs text-blue-800">나</strong>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">{pendingMessage}</p>
              <small className="mt-2 block text-xs text-slate-500">{sending ? '전송 중...' : '저장 상태 확인 필요'}</small>
            </div>
          </article>
        )}
        {sending && <p className="text-sm text-slate-600" role="status">답변을 생성하고 있습니다...</p>}
      </div>

      <div className="border-t border-slate-200 bg-white p-5 sm:p-7">
        <label htmlFor="consultation-message" className="mb-2 block text-sm font-semibold text-slate-700">상담 메시지</label>
        <textarea
          id="consultation-message"
          className="min-h-28 w-full resize-y rounded-md border border-slate-300 px-4 py-3 text-sm leading-6 text-slate-900 focus:border-blue-700 focus:outline-none"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="상담 내용을 입력해주세요."
          disabled={sending}
        />
        <div className="mt-3 flex justify-end">
          <button type="button" className="rounded-md bg-[#0b326b] px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50" onClick={handleSendMessage} disabled={sending || !content.trim()}>
            {sending ? '전송 중...' : '전송'}
          </button>
        </div>
      </div>
    </section>
  )
}
