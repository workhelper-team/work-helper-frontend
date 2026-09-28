import type { ExpertQuestionDetail } from '@/features/expert/types/expertQuestion'

const statusLabel: Record<string, string> = { WAITING: '답변 대기', ANSWERED: '답변 완료' }

interface ExpertQuestionDetailModalProps {
  detail: ExpertQuestionDetail
  onClose: () => void
}

export function ExpertQuestionDetailModal({ detail, onClose }: ExpertQuestionDetailModalProps) {
  return <div className="modal-backdrop" onClick={onClose}><section className="detail-modal qna-detail" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose}>×</button><span className="source-tag">{statusLabel[detail.status] || detail.status}</span><h2>{detail.title}</h2><p className="full-text">{detail.content}</p><div className="answer-list"><h3>전문가 답변</h3>{detail.answers.length === 0 ? <p>아직 등록된 답변이 없습니다.</p> : detail.answers.map((answer) => <article key={answer.answerId}><p>{answer.content}</p><time>{new Date(answer.createdAt).toLocaleDateString('ko-KR')}</time></article>)}</div></section></div>
}
