import { Link } from 'react-router-dom'

import type { Case } from '@/features/cases/types/case'

interface CaseSelectorProps {
  caseId?: string
  cases: Case[]
  loading: boolean
  hasNoCase: boolean
  error: boolean
  onChange: (caseId: string) => void
}

// 기본 화면(caseId 없는 진입)에서 사건을 고르는 공용 선택 영역
export function CaseSelector({ caseId, cases, loading, hasNoCase, error, onChange }: CaseSelectorProps) {
  const includesCurrent = !caseId || cases.some((item) => String(item.caseId) === caseId)

  return (
    <div className="case-select-row">
      <label>
        <span>사건 선택</span>
        <select
          value={caseId ?? ''}
          disabled={loading || cases.length === 0}
          onChange={(event) => onChange(event.target.value)}
        >
          {loading && <option value="">사건을 불러오는 중...</option>}
          {!loading && cases.length === 0 && !caseId && <option value="">등록된 사건 없음</option>}
          {!includesCurrent && <option value={caseId}>사건 #{caseId}</option>}
          {cases.map((item) => (
            <option key={item.caseId} value={String(item.caseId)}>
              #{item.caseId} {item.title}
            </option>
          ))}
        </select>
      </label>

      {hasNoCase && (
        <span className="case-select-hint">
          등록된 사건이 없습니다. 사건을 등록하면 이 화면을 이용할 수 있습니다. <Link to="/cases/new">사건 등록하기</Link>
        </span>
      )}
      {error && <span className="case-select-hint">사건 목록을 불러오지 못했습니다.</span>}
    </div>
  )
}
