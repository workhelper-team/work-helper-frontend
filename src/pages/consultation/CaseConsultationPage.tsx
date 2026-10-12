import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { ConsultationChat } from '@/features/consultation/components/ConsultationChat'
import { ProtectedPageLayout } from '@/shared/components/layout/ProtectedPageLayout'

export default function CaseConsultationPage() {
  const { caseId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const consumedCaseIds = useRef(new Set<string>())
  const [initialMessage, setInitialMessage] = useState<{ caseId: string; question: string } | null>(null)
  const handleInitialQuestionConsumed = useCallback(() => setInitialMessage(null), [])

  const validCaseId = caseId && /^[1-9]\d*$/.test(caseId) && Number.isSafeInteger(Number(caseId))

  useEffect(() => {
    const state: unknown = location.state
    if (!validCaseId || !caseId || !state || typeof state !== 'object' || !('initialQuestion' in state)) return

    const { initialQuestion, ...remainingState } = state
    navigate(`${location.pathname}${location.search}${location.hash}`, {
      replace: true,
      state: Object.keys(remainingState).length ? remainingState : null,
    })
    // StrictMode의 effect 재실행과 같은 사건의 navigation state 재사용을 차단한다.
    if (consumedCaseIds.current.has(caseId)) return
    if (typeof initialQuestion === 'string' && initialQuestion.trim()) {
      consumedCaseIds.current.add(caseId)
      setInitialMessage({ caseId, question: initialQuestion.trim() })
    }
  }, [caseId, validCaseId, location, navigate])

  return (
    <ProtectedPageLayout
      title="AI 상담"
      description="사건에 대해 상담하고 이전 대화 내용을 확인하세요."
      backTo={validCaseId ? `/cases/${caseId}` : '/cases'}
      backLabel={validCaseId ? '사건 상세로' : '내 사건으로'}
    >
      {validCaseId ? (
        <ConsultationChat
          key={caseId}
          caseId={Number(caseId)}
          initialQuestion={initialMessage?.caseId === caseId ? initialMessage.question : undefined}
          onInitialQuestionConsumed={handleInitialQuestionConsumed}
        />
      ) : (
        <div className="rounded-md border border-rose-200 bg-white p-6 text-sm text-rose-700" role="alert">
          잘못된 사건 경로입니다. <Link className="font-semibold underline" to="/cases">사건 목록으로</Link>
        </div>
      )}
    </ProtectedPageLayout>
  )
}
