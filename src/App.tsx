import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth'
import SignupPage from './pages/SignupPage'
import VerifyOtpPage from './pages/VerifyOtpPage'
import LoginPage from './pages/LoginPage'
import SelectPlanPage from './pages/SelectPlanPage'
import PendingPage from './pages/PendingPage'
import DashboardPage from './pages/DashboardPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore()
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/select-plan" element={<ProtectedRoute><SelectPlanPage /></ProtectedRoute>} />
        <Route path="/pending" element={<ProtectedRoute><PendingPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
