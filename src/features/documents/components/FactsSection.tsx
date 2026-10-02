import type { Facts } from '../types/document'

function nullableNumber(value: string): number | null {
  if (value.trim() === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

interface Props {
  value: Facts
  disabled: boolean
  onChange: (value: Facts) => void
}

const textFields: { key: 'hireDate' | 'resignationDate' | 'jobDescription' | 'payDay'; label: string; type?: string }[] = [
  { key: 'hireDate', label: '입사일', type: 'date' },
  { key: 'resignationDate', label: '퇴사일', type: 'date' },
  { key: 'jobDescription', label: '담당 업무' },
  { key: 'payDay', label: '급여 지급일' },
]

const amountFields: { key: 'unpaidWages' | 'unpaidSeverancePay' | 'unpaidOtherAmount'; label: string }[] = [
  { key: 'unpaidWages', label: '미지급 임금' },
  { key: 'unpaidSeverancePay', label: '미지급 퇴직금' },
  { key: 'unpaidOtherAmount', label: '기타 미지급액' },
]

export function FactsSection({ value, disabled, onChange }: Props) {
  return <fieldset disabled={disabled}>
    <legend>근로 및 체불 사실</legend>
    <p className="document-section-description">근무 기간과 미지급 금액 등 확인된 사실을 입력하세요.</p>
    {textFields.map(({ key, label, type }) => <div key={key}>
      <label htmlFor={`facts-${key}`}>{label}</label>
      <input id={`facts-${key}`} type={type ?? 'text'} value={value[key] ?? ''}
        onChange={(event) => onChange({ ...value, [key]: event.target.value })} />
    </div>)}
    <div>
      <label htmlFor="facts-employmentStatus">재직 상태</label>
      <select id="facts-employmentStatus" value={value.employmentStatus ?? ''}
        onChange={(event) => onChange({ ...value, employmentStatus: event.target.value === '' ? null : event.target.value as Facts['employmentStatus'] })}>
        <option value="">선택</option><option value="EMPLOYED">재직 중</option><option value="RESIGNED">퇴사</option>
      </select>
    </div>
    <div>
      <label htmlFor="facts-contractType">근로계약 형태</label>
      <select id="facts-contractType" value={value.contractType ?? ''}
        onChange={(event) => onChange({ ...value, contractType: event.target.value === '' ? null : event.target.value as Facts['contractType'] })}>
        <option value="">선택</option><option value="WRITTEN">서면</option><option value="VERBAL">구두</option>
      </select>
    </div>
    {amountFields.map(({ key, label }) => <div key={key}>
      <label htmlFor={`facts-${key}`}>{label}</label>
      <input id={`facts-${key}`} type="number" min="0" step="1" value={value[key] ?? ''}
        onChange={(event) => onChange({ ...value, [key]: nullableNumber(event.target.value) })} />
    </div>)}
  </fieldset>
}
