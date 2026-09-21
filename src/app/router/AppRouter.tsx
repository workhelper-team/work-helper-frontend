import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { EvidencePage } from '@/pages/evidence/EvidencePage'
import { LegalPage } from '@/pages/legal/LegalPage'
import { ExpertQnaPage } from '@/pages/expert/ExpertQnaPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EvidencePage />} />
        <Route path="/cases/:caseId/evidences" element={<EvidencePage />} />
        <Route path="/legal-documents" element={<LegalPage />} />
        <Route path="/expert-qna" element={<ExpertQnaPage />} />
        <Route path="/cases/:caseId/expert-qna" element={<ExpertQnaPage />} />
      </Routes>
    </BrowserRouter>
  )
}
