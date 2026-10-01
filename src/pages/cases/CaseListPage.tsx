import { CaseList } from '@/features/cases/components/CaseList'
import { ProtectedPageLayout } from '@/shared/components/layout/ProtectedPageLayout'
import { Link } from 'react-router-dom'

export default function CaseListPage() {
  return (
    <ProtectedPageLayout
      title="내 사건"
      description="등록한 사건을 확인하고 상담과 증거자료, 진정서를 사건별로 관리하세요."
      backTo="/"
      backLabel="홈으로"
      action={
        <Link to="/cases/new" className="rounded-md bg-[#0b326b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-900">
          새 사건 등록
        </Link>
      }
    >
      <CaseList />
    </ProtectedPageLayout>
  )
}
