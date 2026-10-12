import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createCase } from '@/features/cases/api/casesApi'
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
  const [question, setQuestion] = useState('')
  const [creatingCase, setCreatingCase] = useState(false)
  const [quickConsultationError, setQuickConsultationError] = useState<string | null>(null)
  const creationPending = useRef(false)

  async function handleQuickConsultation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const initialQuestion = question.trim()
    if (!initialQuestion || creationPending.current) return

    const { user: currentUser, token, tokenExpiresAt } = useAuthStore.getState()
    if (!currentUser || !token || !tokenExpiresAt || tokenExpiresAt <= Date.now()) {
      alert('AI 상담을 시작하려면 로그인해주세요.')
      navigate('/login')
      return
    }

    creationPending.current = true
    setCreatingCase(true)
    setQuickConsultationError(null)
    try {
      const createdCase = await createCase({
        title: initialQuestion.slice(0, 200),
        category: 'WAGE',
      })
      navigate(`/cases/${createdCase.caseId}/consultation`, {
        state: { initialQuestion },
      })
      // 화면 이동이 끝나기 전 추가 제출도 차단한다.
    } catch {
      setQuickConsultationError('사건을 생성하지 못했습니다. 잠시 후 다시 시도해주세요.')
      creationPending.current = false
      setCreatingCase(false)
    }
  }

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
          <form onSubmit={handleQuickConsultation} className="mx-auto mb-8 max-w-3xl text-left" aria-busy={creatingCase}>
            <label htmlFor="quick-consultation-question" className="mb-2 block text-sm font-semibold text-slate-700">빠른 AI 상담 시작</label>
            <div className="flex gap-2 rounded-lg border border-slate-300 bg-white p-2 shadow-sm">
              <input
                id="quick-consultation-question"
                type="text"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && event.nativeEvent.isComposing) event.preventDefault()
                }}
                placeholder="현재 겪고 있는 노동 문제를 간단히 입력해주세요. (예: 마지막 월급을 못 받았어요)"
                className="min-w-0 flex-1 rounded-md px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                disabled={creatingCase}
              />
              <button type="submit" disabled={creatingCase || !question.trim()} className="shrink-0 rounded-md bg-[#0b326b] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50">
                {creatingCase ? '생성 중...' : '전송'}
              </button>
            </div>
            {creatingCase && <p className="mt-2 text-sm text-slate-600" role="status">상담을 위한 사건을 생성하고 있습니다.</p>}
            {quickConsultationError && <p className="mt-2 text-sm text-rose-700" role="alert">{quickConsultationError}</p>}
          </form>
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
