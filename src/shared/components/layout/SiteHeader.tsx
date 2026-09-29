import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { refreshLoginApi } from '@/features/auth/api/authApi'
import { useAuthStore } from '@/features/auth/store/useAuthStore'

export interface SiteMenuItem {
  label: string
  to?: string
  onClick?: () => void
}

interface SiteHeaderProps {
  utilityActions?: ReactNode
  menuItems?: SiteMenuItem[]
  sticky?: boolean
}

const defaultMenuItems: SiteMenuItem[] = [
  { label: '내 사건 관리', to: '/cases' },
]

export default function SiteHeader({ utilityActions, menuItems = defaultMenuItems, sticky = false }: SiteHeaderProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const tokenExpiresAt = useAuthStore((state) => state.tokenExpiresAt)
  const setAuth = useAuthStore((state) => state.setAuth)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // 페이지 이동 시 모바일 메뉴 자동 닫힘
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!tokenExpiresAt) {
      setRemainingSeconds(null)
      return
    }

    const updateRemainingSeconds = () => {
      const remainingMilliseconds = tokenExpiresAt - Date.now()

      if (remainingMilliseconds <= 0) {
        clearAuth()
        navigate('/login', { replace: true })
        return
      }

      setRemainingSeconds(Math.ceil(remainingMilliseconds / 1000))
    }

    updateRemainingSeconds()
    const timerId = window.setInterval(updateRemainingSeconds, 1000)
    return () => window.clearInterval(timerId)
  }, [clearAuth, navigate, tokenExpiresAt])

  const formattedRemainingTime = remainingSeconds === null
    ? null
    : `${String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:${String(remainingSeconds % 60).padStart(2, '0')}`

  const handleRefreshLogin = async () => {
    if (isRefreshing) return

    setIsRefreshing(true)
    try {
      const data = await refreshLoginApi()
      setAuth(data.accessToken, data.user, data.expiresIn)
    } catch {
      alert('로그인 연장에 실패했습니다. 다시 로그인해주세요.')
    } finally {
      setIsRefreshing(false)
    }
  }

  const defaultUtilityActions = user ? (
    <>
      {user.role === 'ADMIN' && (
        <button type="button" onClick={() => navigate('/admin/experts')} className="text-slate-600 hover:text-blue-700">관리자 페이지</button>
      )}
      <span className="font-medium text-slate-700">{user.name}님</span>
      {formattedRemainingTime !== null && (
        <span className={`tabular-nums ${remainingSeconds !== null && remainingSeconds <= 60 ? 'text-rose-600' : 'text-slate-500'}`}>
          {formattedRemainingTime}
        </span>
      )}
      <button type="button" onClick={() => void handleRefreshLogin()} disabled={isRefreshing} className="text-slate-600 hover:text-blue-700 disabled:opacity-50">
        {isRefreshing ? '연장 중...' : '로그인 연장'}
      </button>
      <button type="button" onClick={clearAuth} className="text-slate-600 hover:text-blue-700">로그아웃</button>
    </>
  ) : (
    <>
      <Link to="/login" className="text-slate-600 hover:text-blue-700">로그인</Link>
      <Link to="/signup" className="border-l border-slate-200 pl-3 text-slate-600 hover:text-blue-700">회원가입</Link>
    </>
  )

  return (
    <div className={sticky ? 'sticky top-0 z-30 bg-white' : undefined}>
      <div className="border-b border-slate-200">
        <div className="mx-auto flex h-7 max-w-7xl items-center justify-between gap-3 px-4 text-[10px] text-slate-400 sm:px-6 lg:px-8">
          <span className="truncate">대한민국 근로자를 위한 고용·노동 법률 서비스 플랫폼</span>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-x-3 gap-y-1 text-[10px]">
            {utilityActions ?? defaultUtilityActions}
          </div>
        </div>
      </div>
      
      <header className="border-b border-slate-200 bg-white">
        {/* lg(큰 화면) 이상에서는 3단 그리드로 정확한 중앙 정렬, 작은 화면에서는 좌우 배치 */}
        <div className="mx-auto grid grid-cols-[1fr_auto] lg:grid-cols-[220px_1fr_220px] items-center min-h-[62px] max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          
          {/* 1. 로고 영역 */}
          <div className="flex items-center justify-start">
            <Link className="flex shrink-0 items-center gap-2 whitespace-nowrap text-[#0b326b] no-underline" to="/">
              <b className="grid h-6 w-6 place-items-center rounded-md bg-[#0b326b] text-sm text-white">W</b>
              <strong className="text-[17px] font-bold">WorkHelper</strong>
            </Link>
          </div>
          
          {/* 2. 데스크탑 중앙 메뉴 영역 (lg 브레이크포인트 이상에서만 한 줄로 노출) */}
          <nav className="hidden lg:flex items-center justify-center flex-nowrap gap-x-6 text-base font-medium">
          {menuItems.map((item) => {
            const isCurrent = item.to === pathname
            const className = `whitespace-nowrap no-underline transition hover:text-blue-700 ${isCurrent ? 'text-blue-700 font-semibold' : 'text-slate-700'}`

            return item.to ? (
              <Link key={item.label} className={className} to={item.to}>{item.label}</Link>
            ) : (
              <button
                key={item.label}
                type="button"
                className={`cursor-pointer border-0 bg-transparent p-0 font-medium ${className}`}
                onClick={item.onClick}
              >
                {item.label}
              </button>
            )
          })}
          </nav>

          {/* 모바일/태블릿 화면용 햄버거 메뉴 버튼 (lg 미만 화면에서만 노출) */}
          <div className="flex lg:hidden justify-end">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-blue-600 focus:outline-none"
              aria-label="메뉴 열기"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* 3. 오른쪽 영역 (대칭용 빈 공간 - 데스크탑에서만 작동) */}
          <div className="hidden lg:block"></div>

        </div>

        {/* 모바일/태블릿 화면에서 햄버거 버튼을 눌렀을 때 나타나는 드롭다운 메뉴 */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-3 shadow-lg">
            {menuItems.map((item) => {
              const isCurrent = item.to === pathname
              const className = `block w-full text-left py-2 text-base font-medium no-underline transition hover:text-blue-700 ${isCurrent ? 'text-blue-700 font-semibold' : 'text-slate-700'}`

              return item.to ? (
                <Link key={item.label} className={className} to={item.to}>{item.label}</Link>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  className={`cursor-pointer border-0 bg-transparent p-0 font-medium w-full text-left ${className}`}
                  onClick={() => {
                    item.onClick?.()
                    setMobileMenuOpen(false)
                  }}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        )}
      </header>
    </div>
  )
}
