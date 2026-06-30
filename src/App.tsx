import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './store/auth'
import { ActivationGateModal } from './components/ActivationGateModal'
import { RequireActiveSubscription } from './components/RequireActiveSubscription'
import AdminLayout from './components/AdminLayout'
import { Toaster } from '@/components/ui/toaster'

// Marketing
import MarketingPage from './pages/MarketingPage'

// Auth pages
import SignupPage from './pages/SignupPage'
import VerifyOtpPage from './pages/VerifyOtpPage'
import LoginPage from './pages/LoginPage'
import SelectPlanPage from './pages/SelectPlanPage'
import PendingPage from './pages/PendingPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

// Admin - existing pages
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

// Admin - new pages
import ShopsPage from './pages/admin/ShopsPage'
import ReturnsPage from './pages/admin/ReturnsPage'
import SuppliersPage from './pages/admin/SuppliersPage'
import PerformancePage from './pages/admin/PerformancePage'
import ExpensesPage from './pages/admin/expenses/ExpensesPage'
import ExpenseCategoriesPage from './pages/admin/expenses/ExpenseCategoriesPage'
import RecurringExpensesPage from './pages/admin/expenses/RecurringExpensesPage'
import RegistersPage from './pages/admin/registers/RegistersPage'
import RegisterSessionsPage from './pages/admin/registers/RegisterSessionsPage'
import RegisterReportsPage from './pages/admin/registers/RegisterReportsPage'
import AccountsPage from './pages/admin/accounts/AccountsPage'
import AccountTransferPage from './pages/admin/accounts/AccountTransferPage'
import GeneralLedgerPage from './pages/admin/accounts/GeneralLedgerPage'
import CashflowPage from './pages/admin/accounts/CashflowPage'
import BalanceSheetPage from './pages/admin/accounts/BalanceSheetPage'
import TrialBalancePage from './pages/admin/accounts/TrialBalancePage'
import ReceiptPage from './pages/admin/settings/ReceiptPage'

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
          {/* Marketing */}
          <Route path="/" element={<MarketingPage />} />

          {/* Public auth */}
          <Route path="/signup"          element={<SignupPage />} />
          <Route path="/verify-otp"      element={<VerifyOtpPage />} />
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password"  element={<ResetPasswordPage />} />
          <Route path="/select-plan"     element={<ProtectedRoute><SelectPlanPage /></ProtectedRoute>} />
          <Route path="/pending"         element={<ProtectedRoute><PendingPage /></ProtectedRoute>} />

          {/* Admin - all protected + subscription gated */}
          <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            {/* Overview */}
            <Route path="/dashboard"  element={<G><AdminDashboardPage /></G>} />

            {/* Inventory */}
            <Route path="/products"             element={<G><ProductsPage /></G>} />
            <Route path="/products/categories"  element={<G><CategoriesPage /></G>} />
            <Route path="/inventory"            element={<G><InventoryPage /></G>} />

            {/* Shops & Staff */}
            <Route path="/shops"      element={<G><ShopsPage /></G>} />
            <Route path="/users"      element={<G><UsersPage /></G>} />
            <Route path="/users/roles" element={<G><RolesPage /></G>} />

            {/* Transactions */}
            <Route path="/returns"     element={<G><ReturnsPage /></G>} />
            <Route path="/suppliers"   element={<G><SuppliersPage /></G>} />
            <Route path="/reports"     element={<G><ReportsPage /></G>} />
            <Route path="/performance" element={<G><PerformancePage /></G>} />

            {/* Credit */}
            <Route path="/credit/dashboard" element={<G><CreditDashboardPage /></G>} />
            <Route path="/credit/customers" element={<G><CreditCustomersPage /></G>} />
            <Route path="/credit/accounts"  element={<G><CreditAccountsPage /></G>} />
            <Route path="/credit/reports"   element={<G><CreditReportsPage /></G>} />
            <Route path="/credit/settings"  element={<G><CreditSettingsPage /></G>} />

            {/* Expenses */}
            <Route path="/expenses"             element={<G><ExpensesPage /></G>} />
            <Route path="/expenses/categories"  element={<G><ExpenseCategoriesPage /></G>} />
            <Route path="/expenses/recurring"   element={<G><RecurringExpensesPage /></G>} />

            {/* Cash Register */}
            <Route path="/registers"          element={<G><RegistersPage /></G>} />
            <Route path="/registers/sessions" element={<G><RegisterSessionsPage /></G>} />
            <Route path="/registers/reports"  element={<G><RegisterReportsPage /></G>} />

            {/* Accounting */}
            <Route path="/accounts"                        element={<G><AccountsPage /></G>} />
            <Route path="/accounts/transfer"               element={<G><AccountTransferPage /></G>} />
            <Route path="/accounts/reports/general-ledger" element={<G><GeneralLedgerPage /></G>} />
            <Route path="/accounts/reports/cashflow"       element={<G><CashflowPage /></G>} />
            <Route path="/accounts/reports/balance-sheet"  element={<G><BalanceSheetPage /></G>} />
            <Route path="/accounts/reports/trial-balance"  element={<G><TrialBalancePage /></G>} />

            {/* System settings */}
            <Route path="/settings/shop"    element={<G><SettingsPage /></G>} />
            <Route path="/settings/receipt" element={<G><ReceiptPage /></G>} />
            <Route path="/settings/tax"     element={<G><TaxPage /></G>} />
            <Route path="/settings/payment" element={<G><PaymentPage /></G>} />

            {/* Account */}
            <Route path="/subscription"              element={<G><SubscriptionPage /></G>} />
            <Route path="/subscription/topup"        element={<G><TopupSmsPage /></G>} />
            <Route path="/subscription/topup-callback" element={<G><TopupCallbackPage /></G>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ActivationGateModal />
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
