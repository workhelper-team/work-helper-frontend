import type { Complainant } from '../types/document'

interface Props {
  value: Complainant
  disabled: boolean
  onChange: (value: Complainant) => void
}

const fields: { key: Exclude<keyof Complainant, 'receiveStatus'>; label: string; type?: string }[] = [
  { key: 'name', label: '성명' },
  { key: 'birthDate', label: '생년월일', type: 'date' },
  { key: 'address', label: '주소' },
  { key: 'phone', label: '전화번호', type: 'tel' },
  { key: 'mobilePhone', label: '휴대전화', type: 'tel' },
  { key: 'email', label: '이메일', type: 'email' },
]

export function ComplainantSection({ value, disabled, onChange }: Props) {
  return <fieldset disabled={disabled}>
    <legend>진정인 정보</legend>
    <p className="document-section-description">진정을 신청하는 분의 정보를 확인하세요.</p>
    {fields.map(({ key, label, type }) => <div key={key}>
      <label htmlFor={`complainant-${key}`}>{label}</label>
      <input id={`complainant-${key}`} type={type ?? 'text'} value={value[key] ?? ''}
        onChange={(event) => onChange({ ...value, [key]: event.target.value })} />
    </div>)}
    <div>
      <label htmlFor="complainant-receiveStatus">수신 상태</label>
      <select id="complainant-receiveStatus" value={value.receiveStatus === null ? '' : String(value.receiveStatus)}
        onChange={(event) => onChange({ ...value, receiveStatus: event.target.value === '' ? null : event.target.value === 'true' })}>
        <option value="">선택</option><option value="true">수신</option><option value="false">미수신</option>
      </select>
    </div>
  </fieldset>
}
