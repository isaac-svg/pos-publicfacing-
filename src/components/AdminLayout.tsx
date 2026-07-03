import { useState, useCallback } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Package, Boxes, BarChart2, CreditCard, Users,
  Settings, Menu, X, LogOut, Crown, Tags, FileText, ChevronDown,
  ChevronLeft, ChevronRight, Store, Truck, ArrowLeftRight, TrendingUp,
  ReceiptText, SlidersHorizontal, Calculator, LayoutList, Wallet,
  BookOpen, Scale, MessageSquare, ShieldCheck, UserCheck, Lock,
} from 'lucide-react'
import { useAuthStore } from '../store/auth'
import { useSubscriptionStatus } from '../hooks/useSubscriptionStatus'
import { useActivationGate } from '../store/activationGate'
import { api } from '../lib/api'
import { cn } from '@/lib/utils'
import { FeatureGateModal, type FeatureGateConfig } from './FeatureGateModal'

type PlanId = 'free' | 'solo' | 'growth' | 'vip'
const PLAN_ORDER: Record<PlanId, number> = { free: 0, solo: 1, growth: 2, vip: 3 }

function planAllows(current: string | null | undefined, required: PlanId): boolean {
  const cur = (current ?? 'free') as PlanId
  return (PLAN_ORDER[cur] ?? 0) >= PLAN_ORDER[required]
}

interface NavItem {
  label: string
  to: string
  icon: React.ComponentType<{ className?: string }>
  end?: boolean
  requiredPlan?: PlanId
  gateFeature?: string
  gateDescription?: string
}

interface NavSection {
  heading: string
  items: NavItem[]
  requiredPlan?: PlanId
}

const navSections: NavSection[] = [
  {
    heading: 'Overview',
    items: [{ label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    heading: 'Inventory',
    items: [
      { label: 'Products',    to: '/products',            icon: Package, end: true },
      { label: 'Categories',  to: '/products/categories', icon: Tags },
      { label: 'Allocations', to: '/inventory',           icon: Boxes },
    ],
  },
  {
    heading: 'Shops & Staff',
    items: [
      { label: 'Shops', to: '/shops', icon: Store, end: true,
        requiredPlan: 'growth', gateFeature: 'Multiple Shops', gateDescription: 'Manage a second branch location and keep sales, stock, and staff separate per shop.' },
      { label: 'Users', to: '/users', icon: Users, end: true },
      { label: 'Roles', to: '/users/roles', icon: ShieldCheck },
    ],
  },
  {
    heading: 'Transactions',
    items: [
      { label: 'Returns',     to: '/returns',     icon: ArrowLeftRight, end: true },
      { label: 'Suppliers',   to: '/suppliers',   icon: Truck, end: true,
        requiredPlan: 'growth', gateFeature: 'Suppliers & Purchases', gateDescription: 'Track what you buy, from whom, at what cost - and keep supplier balances up to date.' },
      { label: 'Reports',     to: '/reports',     icon: FileText, end: true },
      { label: 'Performance', to: '/performance', icon: TrendingUp },
    ],
  },
  {
    heading: 'Credit',
    requiredPlan: 'growth' as PlanId,
    items: [
      { label: 'Dashboard',    to: '/credit/dashboard', icon: CreditCard, end: true,
        requiredPlan: 'growth', gateFeature: 'Credit Sales (BNPL)', gateDescription: 'Allow trusted customers to buy now and pay later. Track balances, installments, and payment history.' },
      { label: 'Customers',    to: '/credit/customers', icon: UserCheck, end: true,
        requiredPlan: 'growth', gateFeature: 'Credit Customers', gateDescription: 'Manage customers on credit, set limits, and monitor balances.' },
      { label: 'Accounts',     to: '/credit/accounts',  icon: Boxes, end: true,
        requiredPlan: 'growth', gateFeature: 'Credit Accounts', gateDescription: 'View all open credit accounts and outstanding balances.' },
      { label: 'Reports',      to: '/credit/reports',   icon: BarChart2,
        requiredPlan: 'growth', gateFeature: 'Credit Reports', gateDescription: 'See collection rates, overdue accounts, and credit performance.' },
      { label: 'Credit Setup', to: '/credit/settings',  icon: SlidersHorizontal,
        requiredPlan: 'growth', gateFeature: 'Credit Settings', gateDescription: 'Configure credit limits, payment terms, and reminder schedules.' },
    ],
  },
  {
    heading: 'Expenses',
    requiredPlan: 'growth' as PlanId,
    items: [
      { label: 'Expenses',    to: '/expenses',            icon: ReceiptText, end: true,
        requiredPlan: 'growth', gateFeature: 'Expense Tracking', gateDescription: 'Record rent, salaries, and other business costs to understand your true profit.' },
      { label: 'Categories',  to: '/expenses/categories', icon: SlidersHorizontal,
        requiredPlan: 'growth', gateFeature: 'Expense Categories', gateDescription: 'Organise expenses by type for cleaner reports.' },
      { label: 'Recurring',   to: '/expenses/recurring',  icon: TrendingUp,
        requiredPlan: 'growth', gateFeature: 'Recurring Expenses', gateDescription: 'Set up monthly bills like rent so they are logged automatically.' },
    ],
  },
  {
    heading: 'Cash Register',
    requiredPlan: 'growth' as PlanId,
    items: [
      { label: 'Registers', to: '/registers',          icon: Calculator, end: true,
        requiredPlan: 'growth', gateFeature: 'Cash Registers & Shifts', gateDescription: 'Open and close cashier shifts with opening floats, track cash differences, and run end-of-day reports.' },
      { label: 'Sessions',  to: '/registers/sessions', icon: LayoutList,
        requiredPlan: 'growth', gateFeature: 'Register Sessions', gateDescription: 'View all cashier shift records and closing reconciliations.' },
      { label: 'Reports',   to: '/registers/reports',  icon: BarChart2,
        requiredPlan: 'growth', gateFeature: 'Cash Register Reports', gateDescription: 'End-of-day cash summaries, shortage analysis, and cashier performance.' },
    ],
  },
  {
    heading: 'Accounting',
    requiredPlan: 'vip' as PlanId,
    items: [
      { label: 'Accounts',       to: '/accounts',                         icon: Wallet, end: true,
        requiredPlan: 'vip', gateFeature: '1-Click Accounting', gateDescription: 'Manage all payment accounts (cash, MoMo, bank) with real-time balances.' },
      { label: 'Transfer',       to: '/accounts/transfer',                icon: ArrowLeftRight,
        requiredPlan: 'vip', gateFeature: 'Account Transfers', gateDescription: 'Move money between accounts and record the transaction automatically.' },
      { label: 'General Ledger', to: '/accounts/reports/general-ledger',  icon: BookOpen,
        requiredPlan: 'vip', gateFeature: 'General Ledger', gateDescription: 'Every financial transaction in one real-time log.' },
      { label: 'Cashflow',       to: '/accounts/reports/cashflow',        icon: TrendingUp,
        requiredPlan: 'vip', gateFeature: 'Cashflow Statement', gateDescription: 'See exactly where money comes in and goes out of your business.' },
      { label: 'Balance Sheet',  to: '/accounts/reports/balance-sheet',   icon: Scale,
        requiredPlan: 'vip', gateFeature: 'Balance Sheet', gateDescription: 'Your business financial position at a glance - assets, liabilities, and equity.' },
      { label: 'Trial Balance',  to: '/accounts/reports/trial-balance',   icon: Calculator,
        requiredPlan: 'vip', gateFeature: 'Trial Balance', gateDescription: 'Verify that your books are balanced with one click.' },
    ],
  },
  {
    heading: 'System',
    items: [
      { label: 'Settings',    to: '/settings/shop',     icon: Settings, end: true },
      { label: 'Receipt',     to: '/settings/receipt',  icon: FileText },
      { label: 'Taxes',       to: '/settings/tax',      icon: ReceiptText },
      { label: 'Payment',     to: '/settings/payment',  icon: CreditCard },
      { label: 'SMS Credits', to: '/subscription/topup', icon: MessageSquare },
    ],
  },
  {
    heading: 'Account',
    items: [
      { label: 'Subscription', to: '/subscription', icon: Crown, end: true },
    ],
  },
]


function sectionHasActiveRoute(items: NavItem[], pathname: string) {
  return items.some(item =>
    item.end ? pathname === item.to : (pathname === item.to || pathname.startsWith(item.to + '/')),
  )
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { business, logout, subscription } = useAuthStore()
  const { data: sub } = useSubscriptionStatus()
  const { open: openGate } = useActivationGate()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [featureGate, setFeatureGate] = useState<FeatureGateConfig | null>(null)

  // All sections open by default
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const s of navSections) initial[s.heading] = true
    return initial
  })

  const toggleSection = useCallback((heading: string) => {
    setOpenSections(prev => ({ ...prev, [heading]: !prev[heading] }))
  }, [])

  // sub?.plan is always live from the API; subscription?.plan may be stale from login
  const currentPlan = sub?.plan ?? subscription?.plan ?? 'free'

  function handleNav(to: string, item?: NavItem) {
    // Expired / suspended — block with gate modal
    if (sub?.status === 'suspended' || sub?.status === 'expired') {
      openGate()
      setMobileOpen(false)
      return
    }
    // Feature gating based on plan tier
    if (item?.requiredPlan && !planAllows(currentPlan, item.requiredPlan)) {
      setFeatureGate({
        feature: item.gateFeature ?? item.label,
        description: item.gateDescription ?? `Upgrade to access ${item.label}`,
        requiredPlan: item.requiredPlan,
        currentPlan: currentPlan as PlanId,
      })
      setMobileOpen(false)
      return
    }
    navigate(to)
    setMobileOpen(false)
  }

  async function handleLogout() {
    try { await api.post('/api/v1/business/logout') } catch { /* ignore */ }
    logout()
    navigate('/login')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center h-14 border-b border-border px-3 gap-2 shrink-0">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center shrink-0">
              <span className="text-white text-[10px] font-bold">S</span>
            </div>
            <span className="text-sm font-semibold text-foreground truncate">
              {business?.businessName ?? 'Shepherd POS'}
            </span>
            {business?.businessSlug && (
              <span className="text-[10px] font-mono font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                {business.businessSlug}
              </span>
            )}
          </div>
        )}
        <button
          onClick={() => setSidebarCollapsed(v => !v)}
          className="ml-auto hidden md:flex p-1 rounded text-muted-foreground hover:bg-muted hover:text-muted-foreground transition-colors shrink-0"
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navSections.map(section => {
          const isOpen = openSections[section.heading] ?? true
          const hasActive = sectionHasActiveRoute(section.items, pathname)
          const single = section.items.length === 1

          return (
            <div key={section.heading} className="mb-0.5">
              {!sidebarCollapsed && !single && (
                <button
                  type="button"
                  onClick={() => toggleSection(section.heading)}
                  className={cn(
                    'flex w-full items-center justify-between px-3 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-wider transition-colors',
                    hasActive ? 'text-foreground' : 'text-muted-foreground hover:text-muted-foreground',
                  )}
                >
                  {section.heading}
                  <ChevronDown className={cn('h-3 w-3 transition-transform shrink-0', isOpen && 'rotate-180')} />
                </button>
              )}
              {(sidebarCollapsed || single || isOpen) && section.items.map(item => {
                const active = item.end
                  ? pathname === item.to
                  : (pathname === item.to || pathname.startsWith(item.to + '/'))
                const locked = !!item.requiredPlan && !planAllows(currentPlan, item.requiredPlan)
                return (
                  <button
                    key={item.to}
                    onClick={() => handleNav(item.to, item)}
                    title={locked ? `Upgrade to ${item.requiredPlan} to unlock ${item.label}` : sidebarCollapsed ? item.label : undefined}
                    className={cn(
                      'flex w-full items-center gap-3 mx-1 px-2.5 py-1.5 text-sm rounded-md transition-colors',
                      sidebarCollapsed ? 'justify-center' : '',
                      active
                        ? 'bg-primary text-white'
                        : locked
                        ? 'text-muted-foreground/60 hover:bg-muted/40 hover:text-muted-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                    style={{ width: 'calc(100% - 8px)' }}
                  >
                    {locked
                      ? <Lock className="h-4 w-4 shrink-0 opacity-50" />
                      : <item.icon className="h-4 w-4 shrink-0" />
                    }
                    {!sidebarCollapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}
                    {!sidebarCollapsed && locked && (
                      <Lock className="h-3 w-3 shrink-0 opacity-40" />
                    )}
                  </button>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* Subscription status pill */}
      {!sidebarCollapsed && sub && (
        <div className="px-3 py-2">
          <div className={cn(
            'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium',
            sub.status === 'active' ? 'bg-green-50 text-green-700' :
            sub.status === 'trial'  ? 'bg-amber-50 text-amber-700' :
            'bg-red-50 text-red-700',
          )}>
            <div className={cn(
              'w-1.5 h-1.5 rounded-full shrink-0',
              sub.status === 'active' ? 'bg-green-500' :
              sub.status === 'trial'  ? 'bg-amber-500' :
              'bg-red-500',
            )} />
            <span className="capitalize">{sub.status?.replace(/_/g, ' ')}</span>
            {sub.plan && <span className="text-current/70 ml-auto capitalize">{sub.plan}</span>}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-2 border-t border-border shrink-0">
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-2.5 w-full px-2.5 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors',
            sidebarCollapsed ? 'justify-center' : '',
          )}
          title={sidebarCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-muted" style={{ fontFamily: '"Geist Variable", "Geist", system-ui, sans-serif' }}>
      {/* Desktop sidebar */}
      <aside className={cn(
        'hidden md:flex flex-col border-r border-border bg-card shrink-0 transition-all duration-200',
        sidebarCollapsed ? 'w-14' : 'w-56',
      )}>
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-card shadow-xl flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 p-1.5 rounded text-muted-foreground hover:text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1.5 -ml-1 rounded text-muted-foreground hover:bg-muted"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm text-muted-foreground hidden md:inline">
              {business?.businessName ?? 'Shepherd POS'}
            </span>
            {business?.businessSlug && (
              <span className="hidden md:inline text-[10px] font-mono font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {business.businessSlug}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {sub && (
              <span className={cn(
                'hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
                sub.status === 'active' ? 'bg-green-50 text-green-700' :
                sub.status === 'trial'  ? 'bg-amber-50 text-amber-700' :
                'bg-red-50 text-red-600',
              )}>
                <span className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  sub.status === 'active' ? 'bg-green-500' :
                  sub.status === 'trial'  ? 'bg-amber-500' :
                  'bg-red-500',
                )} />
                {sub.status === 'trial' ? 'Trial' : sub.status === 'active' ? 'Active' : sub.status?.replace(/_/g, ' ')}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-md hover:bg-muted transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Feature gate modal */}
      {featureGate && (
        <FeatureGateModal
          config={featureGate}
          onClose={() => setFeatureGate(null)}
        />
      )}
    </div>
  )
}
