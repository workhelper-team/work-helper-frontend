import { useState } from 'react'

const categoryOptions = ['임금/퇴직금/주휴수당', '근로시간/휴일/연차', '부당해고/징계/권고사직', '직장 내 괴롭힘/성희롱', '기타']

interface ExpertQuestionFormProps {
  onClose: () => void
  onSubmit: (title: string, content: string) => Promise<void>
}

export function ExpertQuestionForm({ onClose, onSubmit }: ExpertQuestionFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState(categoryOptions[0])
  const [businessSize, setBusinessSize] = useState('5인 이상')
  const [weeklyHours, setWeeklyHours] = useState('')
  const [workPeriod, setWorkPeriod] = useState('')
  const [validationMessage, setValidationMessage] = useState('')

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) {
      setValidationMessage('질문 제목과 상세 내용을 입력해주세요.')
      return
    }
    const context = [`상담 분야: ${category}`, `사업장 규모: ${businessSize}`, weeklyHours && `주당 소정근로시간: ${weeklyHours}`, workPeriod && `계속근로기간: ${workPeriod}`].filter(Boolean).join('\n')
    await onSubmit(title.trim(), `${context}\n\n상세 내용:\n${content.trim()}`)
  }

  return <div className="modal-backdrop" onClick={onClose}><section className="detail-modal qna-compose-modal qna-form" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose}>×</button><div className="form-alert">ⓘ주의: 특정 사업장 상호, 대표자 성명, 동료 실명 등 개인정보는 입력하지 말고 익명으로 작성해주세요.</div><h2>전문가에게 1:1 질문 등록</h2>{validationMessage && <p className="notice">{validationMessage}</p>}<label>상담 분야 <b>*</b><div className="choice-row">{categoryOptions.map((option) => <button type="button" className={category === option ? 'selected' : ''} key={option} onClick={() => setCategory(option)}>{option}</button>)}</div></label><fieldset><legend>근무 조건 요약 <span>(선택)</span></legend><div className="form-grid"><label>사업장 규모<div className="choice-row compact">{['5인 미만', '5인 이상', '모름'].map((option) => <button type="button" className={businessSize === option ? 'selected' : ''} key={option} onClick={() => setBusinessSize(option)}>{option}</button>)}</div></label><label>주당 소정근로시간<input value={weeklyHours} onChange={(event) => setWeeklyHours(event.target.value)} placeholder="예: 15시간" /></label><label>계속근로기간<input value={workPeriod} onChange={(event) => setWorkPeriod(event.target.value)} placeholder="예: 1년 2개월" /></label></div></fieldset><label>질문 제목 <b>*</b><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="핵심 쟁점과 근무 상황을 요약해 입력해주세요" /></label><label>상세 내용 <b>*</b><textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder={'1. 입사일 및 퇴사일\n2. 급여 지급 방식 및 실제 근무 정황\n3. 사업주의 주장 및 쟁점이 되는 사항을 최대한 시간 순서대로 적어주세요.'} rows={7} /></label><div className="form-actions"><button className="outline-button" onClick={onClose}>취소</button><button className="navy-button" onClick={() => void handleSubmit()}>질문 등록하기</button></div></section></div>
}
