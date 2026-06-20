import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'

interface SubStatus {
  status: string; plan: string; billingCycle: string
  activatedAt: string; expiresAt: string
  productLimit: number; shopLimit: number; employeeLimit: number | null
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
        if (data.status !== 'active') { navigate('/pending'); return }
        setSub(data)
      })
      .catch(() => navigate('/login'))
  }, [navigate])

  if (!sub) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 h-14 flex items-center justify-between">
        <span className="font-bold">{business?.businessName ?? 'Dashboard'}</span>
        <button onClick={() => { logout(); navigate('/login') }} className="text-sm text-gray-500 hover:text-gray-700">Logout</button>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold capitalize">{sub.plan} Plan</h2>
              <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 mt-1">Active</span>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>Renews: {new Date(sub.expiresAt).toLocaleDateString()}</p>
              <p className="capitalize">{sub.billingCycle}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-xs text-gray-500">Products</p>
              <p className="font-semibold">up to {sub.productLimit?.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-xs text-gray-500">Shops</p>
              <p className="font-semibold">{sub.shopLimit}</p>
            </div>
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-xs text-gray-500">Employees</p>
              <p className="font-semibold">{sub.employeeLimit ?? 'Unlimited'}</p>
            </div>
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-xs text-gray-500">Credit module</p>
              <p className="font-semibold">{sub.creditModuleEnabled ? 'Enabled ✓' : 'Not included'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6 text-center space-y-3">
          <h3 className="font-semibold">Download the POS App</h3>
          <p className="text-sm text-gray-500">Install the Shepherd POS desktop app to start selling.</p>
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
