import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './store/auth'
import { ActivationGateModal } from './components/ActivationGateModal'
import { RequireActiveSubscription } from './components/RequireActiveSubscription'
import AdminLayout from './components/AdminLayout'

// Marketing page
import MarketingPage from './pages/MarketingPage'

// Public pages
import SignupPage from './pages/SignupPage'
import VerifyOtpPage from './pages/VerifyOtpPage'
import LoginPage from './pages/LoginPage'
import SelectPlanPage from './pages/SelectPlanPage'
import PendingPage from './pages/PendingPage'

// Admin pages
import AdminDashboardPage from './pages/admin/DashboardPage'
import ProductsPage from './pages/admin/products/ProductsPage'
import CategoriesPage from './pages/admin/products/CategoriesPage'
import InventoryPage from './pages/admin/InventoryPage'
import ReportsPage from './pages/admin/ReportsPage'
import CreditDashboardPage from './pages/admin/credit/CreditDashboardPage'
import CreditCustomersPage from './pages/admin/credit/CustomersPage'
import CreditAccountsPage from './pages/admin/credit/AccountsPage'
import CreditReportsPage from './pages/admin/credit/CreditReportsPage'
import CreditSettingsPage from './pages/admin/credit/CreditSettingsPage'
import UsersPage from './pages/admin/users/UsersPage'
import RolesPage from './pages/admin/users/RolesPage'
import SettingsPage from './pages/admin/settings/SettingsPage'
import TaxPage from './pages/admin/settings/TaxPage'
import PaymentPage from './pages/admin/settings/PaymentPage'
import SubscriptionPage from './pages/admin/SubscriptionPage'
import TopupSmsPage from './pages/admin/TopupSmsPage'
import TopupCallbackPage from './pages/admin/TopupCallbackPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore()
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

function G({ children }: { children: React.ReactNode }) {
  return <RequireActiveSubscription>{children}</RequireActiveSubscription>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Marketing landing page */}
          <Route path="/" element={<MarketingPage />} />

          {/* Public */}
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/select-plan" element={<ProtectedRoute><SelectPlanPage /></ProtectedRoute>} />
          <Route path="/pending" element={<ProtectedRoute><PendingPage /></ProtectedRoute>} />

          {/* Admin dashboard (with layout + subscription gating) */}
          <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<G><AdminDashboardPage /></G>} />
            <Route path="/products" element={<G><ProductsPage /></G>} />
            <Route path="/products/categories" element={<G><CategoriesPage /></G>} />
            <Route path="/inventory" element={<G><InventoryPage /></G>} />
            <Route path="/reports" element={<G><ReportsPage /></G>} />
            <Route path="/credit/dashboard" element={<G><CreditDashboardPage /></G>} />
            <Route path="/credit/customers" element={<G><CreditCustomersPage /></G>} />
            <Route path="/credit/accounts" element={<G><CreditAccountsPage /></G>} />
            <Route path="/credit/reports" element={<G><CreditReportsPage /></G>} />
            <Route path="/credit/settings" element={<G><CreditSettingsPage /></G>} />
            <Route path="/users" element={<G><UsersPage /></G>} />
            <Route path="/users/roles" element={<G><RolesPage /></G>} />
            <Route path="/settings/shop" element={<G><SettingsPage /></G>} />
            <Route path="/settings/tax" element={<G><TaxPage /></G>} />
            <Route path="/settings/payment" element={<G><PaymentPage /></G>} />
            <Route path="/subscription" element={<G><SubscriptionPage /></G>} />
            <Route path="/subscription/topup" element={<G><TopupSmsPage /></G>} />
            <Route path="/subscription/topup-callback" element={<G><TopupCallbackPage /></G>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ActivationGateModal />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
