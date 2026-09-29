import { useNavigate } from 'react-router-dom'

import { useAuthStore } from '@/features/auth/store/useAuthStore'

// ==========================================================
// 공통 상단 메뉴바 (GNB)
//
// 메인 페이지(MainPage)의 상단바와 동일한 구성/스타일(Tailwind)을 사용한다.
// 도메인 페이지(evidence / legal / expert)는 이 컴포넌트만 사용하고
// 각 페이지마다 별도의 헤더를 만들지 않는다.
//
// 메뉴 이동 규칙
// - AI 법률상담      : 메인 페이지('/')  (AI 상담 팝업은 메인 페이지에서 제공)
// - 서류 분석/OCR    : /evidences        (사건 유무/개수와 무관하게 기본 화면)
// - 진정서 작성      : 메인 페이지('/')
// - 내 사건 관리     : /cases
// - 노무사 1:1 상담  : 일반/관리자 -> /expert-qna, 전문가 -> /expert/questions
// ==========================================================
export function SiteHeader() {
  const navigate = useNavigate()
  const currentUser = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const isLoggedIn = Boolean(currentUser)

  const handleExpertClick = () => {
    if (currentUser?.role === 'EXPERT') return navigate('/expert/questions')
    if (currentUser?.role === 'ADMIN') return navigate('/admin/expert-questions')
    navigate('/expert-qna')
  }

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center space-x-3 cursor-pointer"
        >
          <div className="bg-blue-600 text-white font-bold p-2 rounded-lg flex items-center justify-center">W</div>
          <div className="text-left">
            <span className="text-xl font-extrabold tracking-tight text-slate-900">WorkHelper</span>
            <span className="hidden md:inline-block ml-2 text-xs text-slate-500 border-l pl-2 border-slate-300">대한민국 근로자를 위한 공공 노동 법 서비스 포털</span>
          </div>
        </button>

        <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium text-slate-600">
          <button onClick={() => navigate('/')} className="hover:text-blue-600 transition">AI 법률상담</button>
          <button onClick={() => navigate('/evidences')} className="hover:text-blue-600 transition">서류 분석/OCR</button>
          <button onClick={() => navigate('/')} className="hover:text-blue-600 transition">진정서 작성</button>
          <button onClick={() => navigate('/cases')} className="hover:text-blue-600 transition">내 사건 관리</button>
          <button onClick={handleExpertClick} className="hover:text-blue-600 transition">노무사 1:1 상담</button>
        </nav>

        <div className="flex items-center space-x-3">
          {isLoggedIn ? (
            <div className="flex items-center space-x-2 text-sm">
              {currentUser?.role === 'ADMIN' && (
                <button
                  onClick={() => navigate('/admin/experts')}
                  className="text-xs bg-slate-900 text-white hover:bg-slate-700 px-3 py-1.5 rounded transition"
                >
                  관리자 페이지
                </button>
              )}
              <span className="font-semibold text-slate-700">{currentUser?.name || '홍길동'}님</span>
              <button onClick={handleLogout} className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded text-slate-600">로그아웃</button>
            </div>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="flex items-center space-x-1 text-sm text-slate-600 hover:text-blue-600 px-3 py-2">
                <span>로그인</span>
              </button>
              <button onClick={() => navigate('/signup')} className="flex items-center space-x-1 text-sm bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg shadow-sm transition">
                <span>회원가입</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
