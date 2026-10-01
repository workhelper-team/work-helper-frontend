import { Link, useParams } from 'react-router-dom'

import { ConsultationChat } from '@/features/consultation/components/ConsultationChat'
import { ProtectedPageLayout } from '@/shared/components/layout/ProtectedPageLayout'

export default function CaseConsultationPage() {
  const { caseId } = useParams()

  const validCaseId = caseId && /^[1-9]\d*$/.test(caseId) && Number.isSafeInteger(Number(caseId))

  return (
    <ProtectedPageLayout
      title="AI 상담"
      description="사건에 대해 상담하고 이전 대화 내용을 확인하세요."
      backTo={validCaseId ? `/cases/${caseId}` : '/cases'}
      backLabel={validCaseId ? '사건 상세로' : '내 사건으로'}
    >
      {validCaseId ? (
        <ConsultationChat caseId={Number(caseId)} />
      ) : (
        <div className="rounded-md border border-rose-200 bg-white p-6 text-sm text-rose-700" role="alert">
          잘못된 사건 경로입니다. <Link className="font-semibold underline" to="/cases">사건 목록으로</Link>
        </div>
      )}
    </ProtectedPageLayout>
  )
}
