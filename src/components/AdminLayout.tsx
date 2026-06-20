import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Package, Boxes, BarChart2, CreditCard, Users,
  Settings, Menu, X, LogOut, Crown, Tags, FileText,
} from 'lucide-react'
import { useAuthStore } from '../store/auth'
import { useSubscriptionStatus } from '../hooks/useSubscriptionStatus'
import { useActivationGate } from '../store/activationGate'

interface NavItem {
  label: string
  to: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavSection {
  heading: string
  items: NavItem[]
}

const adminNav: NavSection[] = [
  { heading: 'Overview', items: [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  ]},
  { heading: 'Inventory', items: [
    { label: 'Products', to: '/products', icon: Package },
    { label: 'Categories', to: '/products/categories', icon: Tags },
    { label: 'Allocations', to: '/inventory', icon: Boxes },
  ]},
  { heading: 'Sales', items: [
    { label: 'Reports', to: '/reports', icon: BarChart2 },
  ]},
  { heading: 'Credit', items: [
    { label: 'Dashboard', to: '/credit/dashboard', icon: CreditCard },
    { label: 'Customers', to: '/credit/customers', icon: Users },
    { label: 'Accounts', to: '/credit/accounts', icon: FileText },
    { label: 'Reports', to: '/credit/reports', icon: BarChart2 },
    { label: 'Settings', to: '/credit/settings', icon: Settings },
  ]},
  { heading: 'Management', items: [
    { label: 'Users', to: '/users', icon: Users },
    { label: 'Roles', to: '/users/roles', icon: Crown },
  ]},
  { heading: 'Settings', items: [
    { label: 'Shop', to: '/settings/shop', icon: Settings },
    { label: 'Tax', to: '/settings/tax', icon: FileText },
    { label: 'Payment', to: '/settings/payment', icon: CreditCard },
  ]},
  { heading: 'Account', items: [
    { label: 'Subscription', to: '/subscription', icon: Crown },
  ]},
]

function SidebarLink({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </button>
  )
}

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { business, logout } = useAuthStore()
  const { data: sub } = useSubscriptionStatus()
  const { open: openGate } = useActivationGate()

  function handleNav(to: string) {
    if (sub?.status !== 'active') {
      openGate()
      setDrawerOpen(false)
      return
    }
    navigate(to)
    setDrawerOpen(false)
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <p className="font-bold text-sm truncate">{business?.businessName ?? 'Shepherd POS'}</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-4">
        {adminNav.map(section => (
          <div key={section.heading}>
            <p className="px-3 pb-1 text-xs font-medium text-gray-400 uppercase tracking-wider">{section.heading}</p>
            <div className="space-y-0.5">
              {section.items.map(item => (
                <SidebarLink
                  key={item.to}
                  item={item}
                  active={pathname === item.to || pathname.startsWith(item.to + '/')}
                  onClick={() => handleNav(item.to)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-3 border-t">
        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 border-r bg-white flex-col shrink-0">
        {sidebar}
      </aside>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-lg">
            <div className="absolute right-2 top-2">
              <button onClick={() => setDrawerOpen(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between h-14 px-4 border-b bg-white shrink-0">
          <button onClick={() => setDrawerOpen(true)} className="p-2 -ml-2 text-gray-600">
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold truncate">{business?.businessName ?? 'Dashboard'}</span>
          <button onClick={handleLogout} className="p-2 -mr-2 text-gray-400">
            <LogOut className="h-4 w-4" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
