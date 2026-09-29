import { useState } from 'react'

import './ConsultationChat.css'

interface ConsultationChatProps {
  caseId: number
}

export function ConsultationChat({
  caseId,
}: ConsultationChatProps) {
  const [content, setContent] = useState('')

  function handleSubmit() {
    const trimmedContent = content.trim()

    if (!trimmedContent) {
      return
    }

    console.log('상담 내용:', {
      caseId,
      content: trimmedContent,
    })

    // TODO
    // 이후 상담 API 연결
  }

  return (
    <div className="consultation-page">

      {/* 상단 제목 */}
      <div className="consultation-header">
        <div className="consultation-header-icon">
          AI
        </div>

        <div>
          <h1>
            WorkHelper AI 법률 상담
          </h1>

          <p>
            사건과 관련된 내용을 작성해주세요.
          </p>
        </div>
      </div>

      {/* 안내 */}
      <div className="consultation-notice">
        <span className="notice-icon">
          ✓
        </span>

        <div>
          <strong>
            상담 내용을 자세하게 작성해주세요.
          </strong>

          <p>
            근무기간, 임금, 근로계약서, 퇴직 여부 등
            사건과 관련된 내용을 자유롭게 작성해주세요.
          </p>
        </div>
      </div>

      {/* 입력 영역 */}
      <section className="consultation-input-page">

        <div className="input-page-title">
          <h2>
            상담 내용 입력
          </h2>

          <p>
            어떤 일이 있었는지 구체적으로 작성해주세요.
          </p>
        </div>

        {/* 추천 주제 */}
        <div className="suggested-questions">

          <button
            type="button"
            onClick={() =>
              setContent(
                '퇴직 후 받지 못한 임금이 있습니다. 어떤 절차로 임금을 청구할 수 있는지 상담받고 싶습니다.',
              )
            }
          >
            임금 미지급
          </button>

          <button
            type="button"
            onClick={() =>
              setContent(
                '근로계약서를 작성하지 않았는데 근무한 기간에 대한 임금이나 권리를 인정받을 수 있는지 상담받고 싶습니다.',
              )
            }
          >
            근로계약서 문제
          </button>

          <button
            type="button"
            onClick={() =>
              setContent(
                '퇴직금을 지급받지 못했습니다. 퇴직금 지급 대상인지와 신고 방법을 상담받고 싶습니다.',
              )
            }
          >
            퇴직금 미지급
          </button>

        </div>

        {/* 실제 입력 */}
        <div className="consultation-textarea-wrapper">

          <label htmlFor="consultation-content">
            사건 내용
          </label>

          <textarea
            id="consultation-content"
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            placeholder={
              '예시)\n\n회사에서 약 2년간 근무했습니다.\n퇴직 후 마지막 달 급여를 받지 못했고,\n회사에 문의했지만 아직 지급받지 못한 상태입니다.\n어떻게 해결할 수 있는지 상담받고 싶습니다.'
            }
          />

          <div className="textarea-footer">
            <span>
              {content.length}자
            </span>

            <span>
              개인정보 및 민감한 정보는 필요한 범위에서만 작성해주세요.
            </span>
          </div>

        </div>

        {/* 첨부자료 */}
        <div className="attachment-area">

          <div className="attachment-title">
            <span>
              📎
            </span>

            <strong>
              증빙자료
            </strong>

            <span className="optional">
              선택사항
            </span>
          </div>

          <p>
            근로계약서, 급여명세서, 문자·카카오톡 등
            사건과 관련된 자료를 첨부할 수 있습니다.
          </p>

          <button
            type="button"
            className="attachment-button"
          >
            📎 파일 첨부
          </button>

        </div>

        {/* 하단 버튼 */}
        <div className="consultation-actions">

          <button
            type="button"
            className="cancel-button"
            onClick={() => {
              setContent('')
            }}
          >
            다시 작성
          </button>

          <button
            type="button"
            className="submit-button"
            onClick={handleSubmit}
            disabled={!content.trim()}
          >
            상담 시작하기 →
          </button>

        </div>

      </section>

    </div>
  )
}