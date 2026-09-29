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

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallback =
      user.role === 'ADMIN' ? '/admin/experts' : user.role === 'EXPERT' ? '/expert/questions' : '/'

    return <Navigate to={fallback} replace />
  }

  return children ?? <Outlet />
}