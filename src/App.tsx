import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import CaseListPage from './pages/case/CaseListPage'
import ConsultationPage from './pages/consultation/ConsultationPage'
import PetitionPage from './pages/petition/PetitionPage'
import CommunityPage from './pages/community/CommunityPage'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<CaseListPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/cases" element={<CaseListPage />} />
        <Route path="/consultation" element={<ConsultationPage />} />
        <Route path="/petition" element={<PetitionPage />} />
        <Route path="/community" element={<CommunityPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App
