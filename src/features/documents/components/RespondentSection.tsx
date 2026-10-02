import type { Respondent } from '../types/document'

interface Props {
  value: Respondent
  disabled: boolean
  onChange: (value: Respondent) => void
}

const textFields: { key: 'companyName' | 'name' | 'phone' | 'address'; label: string }[] = [
  { key: 'companyName', label: '사업장명' },
  { key: 'name', label: '대표자명' },
  { key: 'phone', label: '사업장 전화번호' },
  { key: 'address', label: '사업장 주소' },
]

export function RespondentSection({ value, disabled, onChange }: Props) {
  return <fieldset disabled={disabled}>
    <legend>피진정인 및 사업장 정보</legend>
    <p className="document-section-description">진정 대상인 사업장과 대표자 정보를 입력하세요.</p>
    {textFields.map(({ key, label }) => <div key={key}>
      <label htmlFor={`respondent-${key}`}>{label}</label>
      <input id={`respondent-${key}`} value={value[key] ?? ''}
        onChange={(event) => onChange({ ...value, [key]: event.target.value })} />
    </div>)}
    <div>
      <label htmlFor="respondent-businessType">사업 유형</label>
      <select id="respondent-businessType" value={value.businessType ?? ''}
        onChange={(event) => onChange({ ...value, businessType: event.target.value === '' ? null : event.target.value as Respondent['businessType'] })}>
        <option value="">선택</option><option value="BUSINESS">일반 사업장</option><option value="CONSTRUCTION">건설업</option>
      </select>
    </div>
    <div>
      <label htmlFor="respondent-employeeCount">근로자 수</label>
      <input id="respondent-employeeCount" value={value.employeeCount ?? ''}
        onChange={(event) => onChange({ ...value, employeeCount: event.target.value === '' ? null : event.target.value })} />
    </div>
  </fieldset>
}
