import type { DocumentUpdateRequest } from '../types/document'
import { ComplainantSection } from './ComplainantSection'
import { RespondentSection } from './RespondentSection'
import { FactsSection } from './FactsSection'
import { ComplaintContentSection } from './ComplaintContentSection'

interface Props {
  value: DocumentUpdateRequest
  disabled: boolean
  saving: boolean
  dirty: boolean
  onChange: (value: DocumentUpdateRequest) => void
  onSave: () => void
}

export function DocumentForm({ value, disabled, saving, dirty, onChange, onSave }: Props) {
  return <form className="document-form" onSubmit={(event) => { event.preventDefault(); onSave() }}>
    <div className="document-title-field document-panel">
      <label htmlFor="document-title">문서 제목</label>
      <p>저장된 진정서를 구분할 이름을 입력하세요.</p>
      <input id="document-title" disabled={disabled} value={value.title ?? ''}
        onChange={(event) => onChange({ ...value, title: event.target.value })} />
    </div>
    <ComplainantSection value={value.complainant} disabled={disabled}
      onChange={(complainant) => onChange({ ...value, complainant })} />
    <RespondentSection value={value.respondent} disabled={disabled}
      onChange={(respondent) => onChange({ ...value, respondent })} />
    <FactsSection value={value.facts} disabled={disabled}
      onChange={(facts) => onChange({ ...value, facts })} />
    <ComplaintContentSection value={value.content} disabled={disabled}
      onChange={(content) => onChange({ ...value, content })} />
    <div className="document-save-actions">
      <button type="submit" className="document-primary-button" disabled={disabled || !dirty}>{saving ? '저장 중...' : '수정 저장'}</button>
    </div>
  </form>
}
