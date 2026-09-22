import { useParams } from 'react-router-dom'

import { ConsultationChat } from '@/features/consultation/components/ConsultationChat'

export default function CaseConsultationPage() {
  const { caseId } = useParams()

  if (!caseId) {
    return <div>사건 번호를 찾을 수 없습니다.</div>
  }

  return <ConsultationChat caseId={Number(caseId)} />
}