import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { createQuestion, getMyQuestionDetail, getMyQuestions } from '@/features/expert/api/expertApi'
import type { ExpertQuestionDetail, ExpertQuestionSummary } from '@/features/expert/types/expertQuestion'

const statusLabel: Record<string, string> = { WAITING: '답변 대기', ANSWERED: '답변 완료' }
const categoryOptions = ['임금/퇴직금/주휴수당', '근로시간/휴일/연차', '부당해고/징계/권고사직', '직장 내 괴롭힘/성희롱', '기타']

function SiteHeader() {
  return <header className="site-header"><Link className="site-brand" to="/"><b>W</b><strong>WorkHelper</strong></Link><nav><Link to="/legal-documents">AI 법률상담</Link><Link to="/cases/1/evidences">서류 분석/OCR</Link><span>진정서 작성</span><span>내 사건 관리</span><Link className="current-nav" to="/expert-qna">전문가 Q&amp;A</Link></nav><button className="all-menu">▣　전체메뉴</button></header>
}

export function ExpertQnaPage() {
  const { caseId = '1' } = useParams()
  const [items, setItems] = useState<ExpertQuestionSummary[]>([])
  const [detail, setDetail] = useState<ExpertQuestionDetail | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState(categoryOptions[0])
  const [businessSize, setBusinessSize] = useState('5인 이상')
  const [weeklyHours, setWeeklyHours] = useState('')
  const [workPeriod, setWorkPeriod] = useState('')
  const [attachment, setAttachment] = useState<File | null>(null)
  const [status, setStatus] = useState('ALL')
  const [query, setQuery] = useState('')
  const [composeOpen, setComposeOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  async function loadQuestions() {
    setLoading(true)
    try { const result = await getMyQuestions(caseId); setItems(result.content ?? []); setMessage('') }
    catch { setMessage('전문가 Q&A를 이용하려면 로그인과 사건 정보가 필요합니다.') }
    finally { setLoading(false) }
  }

  useEffect(() => { void loadQuestions() }, [caseId])

  async function submitQuestion() {
    if (!title.trim() || !content.trim()) { setMessage('질문 제목과 상세 내용을 입력해주세요.'); return }
    const context = [`상담 분야: ${category}`, `사업장 규모: ${businessSize}`, weeklyHours && `주당 소정근로시간: ${weeklyHours}`, workPeriod && `계속근로기간: ${workPeriod}`].filter(Boolean).join('\n')
    const attachmentNote = attachment ? `\n첨부파일: ${attachment.name} (파일 첨부 API 연동 전, 파일명만 기록됩니다.)` : ''
    try { await createQuestion(caseId, { title: title.trim(), content: `${context}\n\n상세 내용:\n${content.trim()}${attachmentNote}` }); setTitle(''); setContent(''); setAttachment(null); setComposeOpen(false); setMessage('질문이 등록되었습니다.'); await loadQuestions() }
    catch { setMessage('질문 등록에 실패했습니다. 로그인과 사건 권한을 확인해주세요.') }
  }

  async function openQuestion(questionId: number) {
    try { setDetail(await getMyQuestionDetail(caseId, questionId)) }
    catch { setMessage('질문 상세 내용을 불러오지 못했습니다.') }
  }

  const filteredItems = items.filter((item) => {
    const matchesStatus = status === 'ALL' || item.status === status
    return matchesStatus && item.title.toLowerCase().includes(query.toLowerCase())
  })

  return <div className="site-page"><SiteHeader /><section className="page-banner"><div className="container"><p className="breadcrumb">홈　&gt;　전문가 Q&amp;A</p><h1>전문가 Q&amp;A</h1><p>노동 문제에 대해 전문가에게 질문하고 답변을 확인해보세요.</p></div></section><main className="container expert-main"><section className="qna-toolbar"><div className="filter-tabs"><button className={status === 'ALL' ? 'active' : ''} onClick={() => setStatus('ALL')}>전체 ({items.length})</button><button className={status === 'ANSWERED' ? 'active' : ''} onClick={() => setStatus('ANSWERED')}>답변 완료 ({items.filter((item) => item.status === 'ANSWERED').length})</button><button className={status === 'WAITING' ? 'active' : ''} onClick={() => setStatus('WAITING')}>답변 대기 ({items.filter((item) => item.status === 'WAITING').length})</button></div><div className="qna-actions"><label className="search-input">⌕<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="질문 키워드 검색" /></label><button className="navy-button" onClick={() => setComposeOpen(true)}>＋ 질문 등록하기</button></div></section>{message && <p className="notice">{message}</p>}<section className="qna-list">{loading ? <div className="empty-state">질문 목록을 불러오는 중입니다.</div> : filteredItems.length === 0 ? <div className="empty-state"><strong>표시할 질문이 없습니다.</strong><span>검색 조건을 바꾸거나 새 질문을 등록해보세요.</span></div> : filteredItems.map((item) => <button className="qna-card" key={item.questionId} onClick={() => void openQuestion(item.questionId)}><div className="qna-card-copy"><div className="qna-meta"><span className="source-tag">{item.category || '노동 상담'}</span><time>작성일 {new Date(item.createdAt).toLocaleDateString('ko-KR')}</time></div><strong>{item.title}</strong><p>전문가 답변 {item.answerCount}건이 등록된 질문입니다.</p></div><span className={`analysis-badge ${item.status === 'ANSWERED' ? 'done' : ''}`}>{statusLabel[item.status] || item.status}</span><small>상세 보기　›</small></button>)}</section></main>{composeOpen && <div className="modal-backdrop" onClick={() => setComposeOpen(false)}><section className="detail-modal qna-compose-modal qna-form" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setComposeOpen(false)}>×</button><div className="form-alert">ⓘ　주의: 특정 사업장 상호, 대표자 성명, 동료 실명 등 개인정보는 입력하지 말고 익명으로 작성해주세요.</div><h2>전문가에게 1:1 질문 등록</h2><label>상담 분야 <b>*</b><div className="choice-row">{categoryOptions.map((option) => <button type="button" className={category === option ? 'selected' : ''} key={option} onClick={() => setCategory(option)}>{option}</button>)}</div></label><fieldset><legend>근무 조건 요약 <span>(선택)</span></legend><div className="form-grid"><label>사업장 규모<div className="choice-row compact">{['5인 미만', '5인 이상', '모름'].map((option) => <button type="button" className={businessSize === option ? 'selected' : ''} key={option} onClick={() => setBusinessSize(option)}>{option}</button>)}</div></label><label>주당 소정근로시간<input value={weeklyHours} onChange={(event) => setWeeklyHours(event.target.value)} placeholder="예: 15시간" /></label><label>계속근로기간<input value={workPeriod} onChange={(event) => setWorkPeriod(event.target.value)} placeholder="예: 1년 2개월" /></label></div></fieldset><label>질문 제목 <b>*</b><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="핵심 쟁점과 근무 상황을 요약해 입력해주세요" /></label><label>상세 내용 <b>*</b><textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder={'1. 입사일 및 퇴사일\n2. 급여 지급 방식 및 실제 근무 정황\n3. 사업주의 주장 및 쟁점이 되는 사항을 최대한 시간 순서대로 적어주세요.'} rows={7} /></label><label>증빙 자료 첨부 <span>(선택)</span><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => setAttachment(event.target.files?.[0] || null)} /><small>{attachment ? `선택 파일: ${attachment.name}` : '근로계약서, 급여명세서 등 참고자료 (최대 10MB)'}</small></label><div className="form-actions"><button className="outline-button" onClick={() => setComposeOpen(false)}>취소</button><button className="navy-button" onClick={() => void submitQuestion()}>질문 등록하기</button></div></section></div>}{detail && <div className="modal-backdrop" onClick={() => setDetail(null)}><section className="detail-modal qna-detail" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setDetail(null)}>×</button><span className="source-tag">{statusLabel[detail.status] || detail.status}</span><h2>{detail.title}</h2><p className="full-text">{detail.content}</p><div className="answer-list"><h3>전문가 답변</h3>{detail.answers.length === 0 ? <p>아직 등록된 답변이 없습니다.</p> : detail.answers.map((answer) => <article key={answer.answerId}><p>{answer.content}</p><time>{new Date(answer.createdAt).toLocaleDateString('ko-KR')}</time></article>)}</div></section></div>}</div>
}
