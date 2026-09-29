import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import MainPage from '@/pages/MainPage'
import AdminExpertReviewPage from '@/pages/expert/AdminExpertReviewPage'

import CaseListPage from '@/features/cases/pages/CaseListPage'
import CaseCreatePage from '@/features/cases/pages/CaseCreatePage'
import CaseDetailPage from '@/features/cases/pages/CaseDetailPage'
import CaseConsultationPage from '@/features/cases/pages/CaseConsultationPage'

import { EvidencePage } from '@/pages/evidence/EvidencePage'
//import { LegalPage } from '@/pages/legal/LegalPage'
import { ExpertQnaPage } from '@/pages/expert/ExpertQnaPage'
import { ExpertQuestionsPage } from '@/pages/expert/ExpertQuestionsPage'

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
          {/* 관리자: 노무사 1:1 상담 전체 내역 (읽기 전용) */}
          <Route
            path="/admin/expert-questions"
            element={<ExpertQuestionsPage mode="admin" />}
          />
        </Route>

        <Route element={<RouteGuard allowedRoles={['EXPERT']} />}>
          <Route path="/expert/questions" element={<ExpertQuestionsPage />} />
        </Route>

        <Route element={<RouteGuard />}>
          <Route path="/cases" element={<CaseListPage />} />
          <Route path="/cases/new" element={<CaseCreatePage />} />
          <Route path="/cases/:caseId" element={<CaseDetailPage />} />
          <Route
            path="/cases/:caseId/consultation"
            element={<CaseConsultationPage />}
          />

          {/* 서류 분석/OCR 기본 화면 (사건 선택은 화면 안에서) */}
          <Route path="/evidences" element={<EvidencePage />} />

          <Route
            path="/cases/:caseId/evidences"
            element={<EvidencePage />}
          />

          

          {/* 노무사 1:1 상담 기본 화면 (일반/관리자, 사건 선택은 화면 안에서) */}
          <Route path="/expert-qna" element={<ExpertQnaPage />} />

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