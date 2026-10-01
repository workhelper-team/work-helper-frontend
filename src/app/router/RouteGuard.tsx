import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import type { User } from '@/features/auth/types/auth.types'

interface RouteGuardProps {
  allowedRoles?: User['role'][]
  children?: React.ReactNode
}

export function RouteGuard({ allowedRoles, children }: RouteGuardProps) {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const tokenExpiresAt = useAuthStore((state) => state.tokenExpiresAt)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  useEffect(() => {
    if (!user) return
    if (!token || !tokenExpiresAt) {
      clearAuth()
      return
    }

    const remaining = tokenExpiresAt - Date.now()
    if (remaining <= 0) {
      clearAuth()
      return
    }

    const timerId = window.setTimeout(clearAuth, remaining)
    return () => window.clearTimeout(timerId)
  }, [user, token, tokenExpiresAt, clearAuth])

  if (!user || !token || !tokenExpiresAt || tokenExpiresAt <= Date.now()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={user.role === 'ADMIN' ? '/admin/experts' : '/'}
        replace
      />
    )
  }

  return children ?? <Outlet />
}
