import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import MainPage from '@/pages/MainPage'
import AdminExpertReviewPage from '@/pages/expert/AdminExpertReviewPage'
import { RouteGuard } from './RouteGuard'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<RouteGuard allowedRoles={['ADMIN']} />}>
          <Route path="/admin/experts" element={<AdminExpertReviewPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
