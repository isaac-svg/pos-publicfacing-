import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'

interface SubStatus {
  status: string; plan: string; billingCycle: string
  activatedAt: string; expiresAt: string
  trialEndsAt: string | null; trialDaysRemaining: number | null
  productLimit: number | null; categoryLimit: number | null
  dailySalesLimit: number | null; shopLimit: number; employeeLimit: number | null
  creditModuleEnabled: boolean
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { business, logout } = useAuthStore()
  const [sub, setSub] = useState<SubStatus | null>(null)

  useEffect(() => {
    api.get('/api/v1/subscriptions/status')
      .then(r => {
        const data = r.data.data
        if (data.status !== 'active' && data.status !== 'trial') { navigate('/pending'); return }
        setSub(data)
      })
      .catch(() => navigate('/login'))
  }, [navigate])

  if (!sub) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>

  const isTrial = sub.status === 'trial'

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b px-6 h-14 flex items-center justify-between">
        <span className="font-bold">{business?.businessName ?? 'Dashboard'}</span>
        <button onClick={() => { logout(); navigate('/login') }} className="text-sm text-muted-foreground hover:text-foreground">Logout</button>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-6">
        {isTrial && (
          <div className="bg-muted border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm text-amber-800">
              <span className="text-lg shrink-0">🎁</span>
              <span>
                You're on a <strong>free trial</strong> — {sub.trialDaysRemaining != null
                  ? <>{sub.trialDaysRemaining} day{sub.trialDaysRemaining !== 1 ? 's' : ''} remaining</>
                  : <>ends {new Date(sub.trialEndsAt!).toLocaleDateString()}</>
                }. All features are unlocked.
              </span>
            </div>
            <button
              onClick={() => navigate('/select-plan')}
              className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-md bg-amber-600 text-white hover:bg-amber-700"
            >
              Choose a plan
            </button>
          </div>
        )}

        <div className="bg-card rounded-lg border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold capitalize">{sub.plan} Plan</h2>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                isTrial ? 'bg-amber-100 text-foreground' : 'bg-green-100 text-accent-foreground'
              }`}>{isTrial ? 'Trial' : 'Active'}</span>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              {isTrial && sub.trialEndsAt ? (
                <p>Trial ends: {new Date(sub.trialEndsAt).toLocaleDateString()}</p>
              ) : sub.expiresAt ? (
                <>
                  <p>Renews: {new Date(sub.expiresAt).toLocaleDateString()}</p>
                  <p className="capitalize">{sub.billingCycle}</p>
                </>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-background rounded-md p-3">
              <p className="text-xs text-muted-foreground">Products</p>
              <p className="font-semibold">{sub.productLimit != null ? `up to ${sub.productLimit.toLocaleString()}` : 'Unlimited'}</p>
            </div>
            <div className="bg-background rounded-md p-3">
              <p className="text-xs text-muted-foreground">Categories</p>
              <p className="font-semibold">{sub.categoryLimit != null ? `up to ${sub.categoryLimit}` : 'Unlimited'}</p>
            </div>
            <div className="bg-background rounded-md p-3">
              <p className="text-xs text-muted-foreground">Sales / day</p>
              <p className="font-semibold">{sub.dailySalesLimit != null ? `up to ${sub.dailySalesLimit}` : 'Unlimited'}</p>
            </div>
            <div className="bg-background rounded-md p-3">
              <p className="text-xs text-muted-foreground">Shops</p>
              <p className="font-semibold">{sub.shopLimit}</p>
            </div>
            <div className="bg-background rounded-md p-3">
              <p className="text-xs text-muted-foreground">Employees</p>
              <p className="font-semibold">{sub.employeeLimit ?? 'Unlimited'}</p>
            </div>
            <div className="bg-background rounded-md p-3">
              <p className="text-xs text-muted-foreground">Credit module</p>
              <p className="font-semibold">{sub.creditModuleEnabled ? 'Enabled' : 'Not included'}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6 text-center space-y-3">
          <h3 className="font-semibold">Download the POS App</h3>
          <p className="text-sm text-muted-foreground">Install the Shepherd POS desktop app to start selling.</p>
          <a
            href="https://github.com/your-org/shepherd-pos/releases/latest"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block h-10 px-6 rounded-md bg-blue-600 text-white font-medium text-sm leading-10 hover:bg-blue-700"
          >
            Download for Windows
          </a>
        </div>
      </main>
    </div>
  )
}
