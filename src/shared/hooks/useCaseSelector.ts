import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { getCases } from '@/features/cases/api/casesApi'
import type { Case } from '@/features/cases/types/case'

// ==========================================================
// 사건 선택 훅 (evidence / expert 도메인 공용)
//
// - 메뉴에서 들어온 기본 화면(/evidences, /expert-qna)은 caseId가 없다.
//   이때 로그인 사용자의 실제 사건 목록을 조회해 화면 안에서 사건을 선택하게 한다.
//   (임의의 caseId=1 사용 금지, 사건이 없으면 화면은 열리되 사건 등록을 안내)
// - 사건 route(/cases/:caseId/...)로 들어오면 route의 caseId를 그대로 사용한다.
// ==========================================================
export function useCaseSelector(basePath: 'evidences' | 'expert-qna') {
  const { caseId: routeCaseId } = useParams<{ caseId: string }>()
  const navigate = useNavigate()

  const [cases, setCases] = useState<Case[]>([])
  const [selectedCaseId, setSelectedCaseId] = useState('')
  const [casesLoading, setCasesLoading] = useState(true)
  const [casesError, setCasesError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadCases() {
      try {
        const result = await getCases(undefined, 0, 100)
        if (cancelled) return

        const list = result.content ?? []
        setCases(list)

        // 기본 화면에서는 첫 번째 사건을 기본 선택한다.
        if (list.length > 0) {
          setSelectedCaseId((prev) => prev || String(list[0].caseId))
        }
      } catch {
        if (!cancelled) setCasesError(true)
      } finally {
        if (!cancelled) setCasesLoading(false)
      }
    }

    void loadCases()

    return () => {
      cancelled = true
    }
  }, [])

  const caseId = routeCaseId ?? (selectedCaseId || undefined)

  function changeCase(nextCaseId: string) {
    if (routeCaseId) {
      navigate(`/cases/${nextCaseId}/${basePath}`)
      return
    }
    setSelectedCaseId(nextCaseId)
  }

  return {
    caseId,
    cases,
    casesLoading,
    casesError,
    hasNoCase: !casesLoading && !casesError && cases.length === 0 && !routeCaseId,
    changeCase,
  }
}
