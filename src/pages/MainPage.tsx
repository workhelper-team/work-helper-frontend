import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import SiteHeader, { type SiteMenuItem } from '../shared/components/layout/SiteHeader'

const entries = [
  { title: 'AI 상담 시작', description: '사건을 선택한 뒤 상담 내역을 확인하고 새 질문을 남겨보세요.' },
  { title: '서류 OCR 분석', description: '사건에 증빙서류를 등록하고 분석 결과를 확인해보세요.' },
  { title: '진정서 작성', description: '상담 내용을 바탕으로 진정서 초안을 만들고 수정해보세요.' },
  { title: '전문가 Q&A', description: '사건에 관해 전문가에게 질문하고 답변을 확인해보세요.' },
]

const guides = [
  { title: '임금/퇴직금', description: '체불임금 해결 절차와 퇴직금 계산에 관한 기본 정보를 확인하세요.' },
  { title: '근로시간/휴일', description: '주휴수당과 연차휴가에 관한 기본 정보를 확인하세요.' },
  { title: '해고/징계', description: '부당해고 구제 신청과 준비 절차를 확인하세요.' },
  { title: '직장 내 괴롭힘', description: '사실관계와 증빙자료를 기록하는 방법을 확인하세요.' },
]

export default function MainPage() {
  const user = useAuthStore((state) => state.user)
  const isLoggedIn = Boolean(user)
  const navigate = useNavigate()

  const handleMyCasesClick = () => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    navigate('/cases')
  }

  // SiteHeader에 전달할 메뉴 아이템 정의
  const menuItems: SiteMenuItem[] = [
    { label: 'AI 상담', to: '/cases' },
    { label: '서류 분석/OCR', to: '/cases' },
    { label: '진정서 작성', to: '/cases' },
    { label: '내 사건 관리', onClick: handleMyCasesClick },
    { label: '전문가 Q&A', to: '/cases' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <SiteHeader
        sticky
        menuItems={menuItems}
      />

      <main>
        <section className="bg-gradient-to-b from-blue-50/60 to-white py-20 px-4 text-center border-b border-slate-100">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">근로자를 위한 노동 문제 도우미, WorkHelper</h1>
          <p className="text-slate-600 mb-8">사건을 등록하고 상담, 증빙서류 분석, 진정서 작성까지 이어가세요.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/cases" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium">내 사건 관리</Link>
            <Link to="/cases/new" className="bg-white border border-blue-600 text-blue-700 px-6 py-3 rounded-lg font-medium">새 사건 등록</Link>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-xl font-bold mb-3">사건별 서비스</h2>
          <p className="text-sm text-slate-600 mb-6">사건 목록에서 원하는 사건을 선택하면 각 기능으로 이동할 수 있습니다.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {entries.map((entry) => (
              <article key={entry.title} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold mb-3">{entry.title}</h3>
                <p className="text-sm text-slate-600 mb-5">{entry.description}</p>
                <Link to="/cases" className="text-sm font-semibold text-blue-600">사건 선택하기 →</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <h2 className="text-xl font-bold mb-6">주요 노동 권익 안내</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {guides.map((guide) => (
              <article key={guide.title} className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold mb-2">{guide.title}</h3>
                <p className="text-sm text-slate-600">{guide.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}