import { Link, useParams } from 'react-router-dom'

import { ConsultationChat } from '@/features/consultation/components/ConsultationChat'

export default function CaseConsultationPage() {
  const { caseId } = useParams()

  if (!caseId || !/^[1-9]\d*$/.test(caseId) || !Number.isSafeInteger(Number(caseId))) {
    return <div>잘못된 사건 경로입니다. <Link to="/cases">사건 목록으로</Link></div>
  }

  return <ConsultationChat caseId={Number(caseId)} />
}
