import type { ExpertQuestionDetail } from '@/features/expert/types/expertQuestion'

const statusLabel: Record<string, string> = { WAITING: '답변 대기', ANSWERED: '답변 완료' }

// ==========================================================
// 질문 본문 파싱
//
// 질문 등록 시 본문은 아래 형식으로 저장된다.
//   상담 분야: ...
//   사업장 규모: ...
//   (주당 소정근로시간 / 계속근로기간)
//
//   상세 내용:
//   본문...
//
// 이 형식이면 "근무 조건 정보"와 "상세 내용"으로 나눠서 보여주고,
// 형식이 아니면 전체를 본문으로 보여준다.
// ==========================================================
function parseContent(content: string) {
  const marker = '상세 내용:'
  const index = content.indexOf(marker)

  if (index === -1) {
    return { info: [] as { label: string; value: string }[], body: content }
  }

  const info = content
    .slice(0, index)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const colon = line.indexOf(':')
      return colon === -1
        ? { label: '', value: line }
        : { label: line.slice(0, colon).trim(), value: line.slice(colon + 1).trim() }
    })
    .filter((item) => item.value)

  return { info, body: content.slice(index + marker.length).trim() }
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

// 질문 상세 공통 화면 (일반 사용자 / 전문가 / 관리자 공용, 읽기 전용 표시 영역)
export function ExpertQuestionDetailView({ detail }: { detail: ExpertQuestionDetail }) {
  const { info, body } = parseContent(detail.content ?? '')
  const answers = detail.answers ?? []
  const answered = answers.length > 0

  return (
    <div className="qd">
      <div className="qd-head">
        <span className={`qd-status ${answered ? 'done' : ''}`}>
          {statusLabel[detail.status] || detail.status}
        </span>
        <h2>{detail.title}</h2>
      </div>

      <dl className="qd-meta">
        <div><dt>질문 번호</dt><dd>#{detail.questionId}</dd></div>
        <div><dt>사건 번호</dt><dd>#{detail.caseId}</dd></div>
        <div><dt>등록일시</dt><dd>{formatDateTime(detail.createdAt)}</dd></div>
        <div><dt>전문가 답변</dt><dd>{answers.length}건</dd></div>
      </dl>

      {info.length > 0 && (
        <section className="qd-section">
          <h3>근무 조건 정보</h3>
          <dl className="qd-info">
            {info.map((item, index) => (
              <div key={`${item.label}-${index}`}>
                <dt>{item.label || '정보'}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="qd-section">
        <h3>상세 내용</h3>
        <p className="qd-body">{body || '입력된 상세 내용이 없습니다.'}</p>
      </section>

      <section className="qd-section">
        <h3>전문가 답변 <span className="qd-count">{answers.length}</span></h3>
        {answered ? (
          <div className="qd-answers">
            {answers.map((answer) => (
              <article className="qd-answer" key={answer.answerId}>
                <div className="qd-answer-head">
                  <span className="qd-avatar">노</span>
                  <div>
                    <strong>노무사 답변</strong>
                    <small>답변 #{answer.answerId} · {formatDateTime(answer.createdAt)}</small>
                  </div>
                </div>
                <p>{answer.content}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="qd-empty">아직 등록된 답변이 없습니다. 전문가가 확인하는 대로 답변이 등록됩니다.</p>
        )}
      </section>
    </div>
  )
}
