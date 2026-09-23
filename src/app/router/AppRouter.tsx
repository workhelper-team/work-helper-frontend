import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import MainPage from '@/pages/MainPage'
import AdminExpertReviewPage from '@/pages/expert/AdminExpertReviewPage'

import CaseListPage from '@/features/cases/pages/CaseListPage'
import CaseCreatePage from '@/features/cases/pages/CaseCreatePage'
import CaseDetailPage from '@/features/cases/pages/CaseDetailPage'
import CaseConsultationPage from '@/features/cases/pages/CaseConsultationPage'

import { RouteGuard } from './RouteGuard'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route element={<RouteGuard allowedRoles={['ADMIN']} />}>
          <Route
            path="/admin/experts"
            element={<AdminExpertReviewPage />}
          />
        </Route>

        <Route element={<RouteGuard />}>
          <Route path="/cases" element={<CaseListPage />} />
          <Route path="/cases/new" element={<CaseCreatePage />} />
          <Route path="/cases/:caseId" element={<CaseDetailPage />} />
          <Route
            path="/cases/:caseId/consultation"
            element={<CaseConsultationPage />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
