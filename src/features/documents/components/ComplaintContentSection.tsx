import type { ComplaintContent } from '../types/document'

function nullableNumber(value: string): number | null {
  if (value.trim() === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

interface Props {
  value: ComplaintContent
  disabled: boolean
  onChange: (value: ComplaintContent) => void
}

export function ComplaintContentSection({ value, disabled, onChange }: Props) {
  return <fieldset disabled={disabled}>
    <legend>진정 내용</legend>
    <div>
      <label htmlFor="content-claimReason">진정 사유</label>
      <textarea id="content-claimReason" rows={8} value={value.claimReason}
        onChange={(event) => onChange({ ...value, claimReason: event.target.value })} />
    </div>
    <div>
      <label htmlFor="content-targetLaborOffice">관할 노동관서</label>
      <input id="content-targetLaborOffice" value={value.targetLaborOffice ?? ''}
        onChange={(event) => onChange({ ...value, targetLaborOffice: event.target.value })} />
    </div>
    <div>
      <label htmlFor="content-totalUnpaidAmount">총 체불액</label>
      <input id="content-totalUnpaidAmount" type="number" min="0" step="1" value={value.totalUnpaidAmount ?? ''}
        onChange={(event) => onChange({ ...value, totalUnpaidAmount: nullableNumber(event.target.value) })} />
    </div>
  </fieldset>
}
