// ==========================================================
// 상담 채팅 컴포넌트
//
// 특정 사건의 상담 메시지를 불러오고
// 사용자가 새로운 상담 메시지를 입력해서 전송할 수 있다.
// ==========================================================

import { useEffect, useState } from 'react'

import {
  getConsultationMessages,
  sendConsultationMessage,
} from '../api/consultationApi'

import type { ConsultationMessage } from '../types/consultation'

interface ConsultationChatProps {
  caseId: number
}

export function ConsultationChat({
  caseId,
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

  // 사건의 상담 메시지 조회
  useEffect(() => {
    async function loadMessages() {
      try {
        setError(null)
        setLoading(true)

        const response = await getConsultationMessages(caseId)

        setMessages(response)
      } catch (err) {
        console.error(err)

        setError('상담 내용을 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadMessages()
  }, [caseId])

  // 상담 메시지 전송
  async function handleSendMessage() {
    if (!content.trim()) {
      return
    }

    try {
      setSending(true)
      setError(null)

      const newMessage = await sendConsultationMessage(
        caseId,
        {
          content: content.trim(),
        },
      )

      setMessages((previousMessages) => [
        ...previousMessages,
        newMessage,
      ])

      setContent('')
    } catch (err) {
      console.error(err)

      setError('상담 메시지를 전송하지 못했습니다.')
    } finally {
      setSending(false)
    }
  }

  // 로딩 중
  if (loading) {
    return <div>상담 내용을 불러오는 중...</div>
  }

  return (
    <div>
      <h2>상담</h2>

      {/* 에러 메시지 */}
      {error && <p>{error}</p>}

      {/* 상담 메시지 목록 */}
      <div>
        {messages.length === 0 ? (
          <p>아직 상담 내용이 없습니다.</p>
        ) : (
          messages.map((message) => (
            <div key={message.messageId}>
              {/* 메시지를 보낸 사람 */}
              <strong>
                {message.role === 'USER'
                  ? '나'
                  : '상담 AI'}
              </strong>

              {/* 상담 내용 */}
              <p>{message.content}</p>

              {/* 작성 시간 */}
              <small>{message.createdAt}</small>
            </div>
          ))
        )}
      </div>

      {/* 상담 메시지 입력 */}
      <div>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="상담 내용을 입력해주세요."
          disabled={sending}
        />

        <button
          type="button"
          onClick={handleSendMessage}
          disabled={sending || !content.trim()}
        >
          {sending ? '전송 중...' : '전송'}
        </button>
      </div>
    </div>
  )
}