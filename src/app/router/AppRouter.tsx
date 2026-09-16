import { BrowserRouter, Route, Routes } from 'react-router-dom'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={null} />
      </Routes>
    </BrowserRouter>
  )
}
