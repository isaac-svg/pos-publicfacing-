import { useState, useCallback } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Package, Boxes, BarChart2, CreditCard, Users,
  Settings, Menu, X, LogOut, Crown, Tags, FileText, ChevronDown,
  ChevronLeft, ChevronRight, Store, Truck, ArrowLeftRight, TrendingUp,
  ReceiptText, SlidersHorizontal, Calculator, LayoutList, Wallet,
  BookOpen, Scale, MessageSquare, ShieldCheck, UserCheck,
} from 'lucide-react'
import { useAuthStore } from '../store/auth'
import { useSubscriptionStatus } from '../hooks/useSubscriptionStatus'
import { useActivationGate } from '../store/activationGate'
import { api } from '../lib/api'

interface NavItem {
  label: string
  to: string
  icon: React.ComponentType<{ className?: string }>
  end?: boolean
}

interface NavSection {
  heading: string
  items: NavItem[]
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
      { label: 'Shops', to: '/shops', icon: Store, end: true },
      { label: 'Users', to: '/users', icon: Users, end: true },
      { label: 'Roles', to: '/users/roles', icon: ShieldCheck },
    ],
  },
  {
    heading: 'Transactions',
    items: [
      { label: 'Returns',     to: '/returns',     icon: ArrowLeftRight, end: true },
      { label: 'Suppliers',   to: '/suppliers',   icon: Truck, end: true },
      { label: 'Reports',     to: '/reports',     icon: FileText, end: true },
      { label: 'Performance', to: '/performance', icon: TrendingUp },
    ],
  },
  {
    heading: 'Credit',
    items: [
      { label: 'Dashboard',    to: '/credit/dashboard', icon: CreditCard, end: true },
      { label: 'Customers',    to: '/credit/customers', icon: UserCheck, end: true },
      { label: 'Accounts',     to: '/credit/accounts',  icon: Boxes, end: true },
      { label: 'Reports',      to: '/credit/reports',   icon: BarChart2 },
      { label: 'Credit Setup', to: '/credit/settings',  icon: SlidersHorizontal },
    ],
  },
  {
    heading: 'Expenses',
    items: [
      { label: 'Expenses',    to: '/expenses',            icon: ReceiptText, end: true },
      { label: 'Categories',  to: '/expenses/categories', icon: SlidersHorizontal },
      { label: 'Recurring',   to: '/expenses/recurring',  icon: TrendingUp },
    ],
  },
  {
    heading: 'Cash Register',
    items: [
      { label: 'Registers', to: '/registers',          icon: Calculator, end: true },
      { label: 'Sessions',  to: '/registers/sessions', icon: LayoutList },
      { label: 'Reports',   to: '/registers/reports',  icon: BarChart2 },
    ],
  },
  {
    heading: 'Accounting',
    items: [
      { label: 'Accounts',       to: '/accounts',                         icon: Wallet, end: true },
      { label: 'Transfer',       to: '/accounts/transfer',                icon: ArrowLeftRight },
      { label: 'General Ledger', to: '/accounts/reports/general-ledger',  icon: BookOpen },
      { label: 'Cashflow',       to: '/accounts/reports/cashflow',        icon: TrendingUp },
      { label: 'Balance Sheet',  to: '/accounts/reports/balance-sheet',   icon: Scale },
      { label: 'Trial Balance',  to: '/accounts/reports/trial-balance',   icon: Calculator },
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

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

function sectionHasActiveRoute(items: NavItem[], pathname: string) {
  return items.some(item =>
    item.end ? pathname === item.to : (pathname === item.to || pathname.startsWith(item.to + '/')),
  )
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { business, logout } = useAuthStore()
  const { data: sub } = useSubscriptionStatus()
  const { open: openGate } = useActivationGate()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // All sections open by default
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const s of navSections) initial[s.heading] = true
    return initial
  })

  const toggleSection = useCallback((heading: string) => {
    setOpenSections(prev => ({ ...prev, [heading]: !prev[heading] }))
  }, [])

  function handleNav(to: string) {
    if (sub?.status !== 'active' && sub?.status !== 'trial') {
      openGate()
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
      <div className="flex items-center h-14 border-b border-slate-200 px-3 gap-2 shrink-0">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center shrink-0">
              <span className="text-white text-[10px] font-bold">S</span>
            </div>
            <span className="text-sm font-semibold text-slate-900 truncate">
              {business?.businessName ?? 'Shepherd POS'}
            </span>
          </div>
        )}
        <button
          onClick={() => setSidebarCollapsed(v => !v)}
          className="ml-auto hidden md:flex p-1 rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0"
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
                    hasActive ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600',
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
                return (
                  <button
                    key={item.to}
                    onClick={() => handleNav(item.to)}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={cn(
                      'flex w-full items-center gap-3 mx-1 px-2.5 py-1.5 text-sm rounded-md transition-colors',
                      sidebarCollapsed ? 'justify-center' : '',
                      active
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                    )}
                    style={{ width: sidebarCollapsed ? 'calc(100% - 8px)' : 'calc(100% - 8px)' }}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
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
      <div className="p-2 border-t border-slate-200 shrink-0">
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-2.5 w-full px-2.5 py-2 text-sm text-slate-500 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors',
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
    <div className="flex h-screen bg-slate-50" style={{ fontFamily: '"Geist Variable", "Geist", system-ui, sans-serif' }}>
      {/* Desktop sidebar */}
      <aside className={cn(
        'hidden md:flex flex-col border-r border-slate-200 bg-white shrink-0 transition-all duration-200',
        sidebarCollapsed ? 'w-14' : 'w-56',
      )}>
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
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
        <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1.5 -ml-1 rounded text-slate-500 hover:bg-slate-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm text-slate-500 hidden md:inline">
              {business?.businessName ?? 'Shepherd POS'}
            </span>
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
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 px-2.5 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
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
    </div>
  )
}
