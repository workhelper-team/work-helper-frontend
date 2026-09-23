// ==========================================================
// 사건 목록 컴포넌트
//
// GET /api/cases를 호출해서
// 현재 로그인한 사용자의 사건 목록을 화면에 표시한다.
// ==========================================================

import { useEffect, useState } from 'react'

import { getCases } from '../api/casesApi'

import type { Case } from '../types/case'

export function CaseList() {
  // 사건 목록
  const [cases, setCases] = useState<Case[]>([])

  // 로딩 상태
  const [loading, setLoading] = useState(true)

  // 에러 메시지
  const [error, setError] = useState<string | null>(null)

  // 컴포넌트가 처음 실행될 때 사건 목록 조회
  useEffect(() => {
    async function loadCases() {
      try {
        setLoading(true)

        const response = await getCases()

        setCases(response.content)
      } catch (err) {
        console.error(err)

        setError('사건 목록을 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadCases()
  }, [])

  // 로딩 중
  if (loading) {
    return <div>사건 목록을 불러오는 중...</div>
  }

  // 에러 발생
  if (error) {
    return <div>{error}</div>
  }

  // 사건이 없는 경우
  if (cases.length === 0) {
    return <div>등록된 사건이 없습니다.</div>
  }

  // 사건 목록
  return (
    <div>
      <h2>내 사건 목록</h2>

      {cases.map((item) => (
        <div key={item.caseId}>
          {/* 사건 제목 */}
          <h3>{item.title}</h3>

          {/* 사건 유형 */}
          <p>유형: {item.category}</p>

          {/* 사건 상태 */}
          <p>상태: {item.status}</p>

          {/* 사건 요약 */}
          {item.summary && <p>{item.summary}</p>}
        </div>
      ))}
    </div>
  )
}