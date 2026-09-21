import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { EvidencePage } from '@/pages/evidence/EvidencePage'
import { LegalPage } from '@/pages/legal/LegalPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EvidencePage />} />
        <Route path="/cases/:caseId/evidences" element={<EvidencePage />} />
        <Route path="/legal-documents" element={<LegalPage />} />
      </Routes>
    </BrowserRouter>
  )
}
