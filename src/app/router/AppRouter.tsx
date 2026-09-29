import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import MainPage from '@/pages/MainPage'
import AdminExpertReviewPage from '@/pages/expert/AdminExpertReviewPage'

import CaseListPage from '@/pages/cases/CaseListPage'
import CaseCreatePage from '@/pages/cases/CaseCreatePage'
import CaseDetailPage from '@/pages/cases/CaseDetailPage'
import CaseConsultationPage from '@/pages/consultation/CaseConsultationPage'

import { EvidencePage } from '@/pages/evidence/EvidencePage'
import { DocumentPage } from '@/pages/documents/DocumentPage'
import { ExpertQnaPage } from '@/pages/expert/ExpertQnaPage'

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

          <Route
            path="/cases/:caseId/evidences"
            element={<EvidencePage />}
          />
          <Route path="/cases/:caseId/documents" element={<DocumentPage />} />

          <Route
            path="/cases/:caseId/expert-qna"
            element={<ExpertQnaPage />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
