import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'

interface Plan {
  id: string; name: string; productLimit: number; shopLimit: number
  employeeLimit: number | null; creditModuleEnabled: boolean; features: string[]
}

export default function SelectPlanPage() {
  const navigate = useNavigate()
  const { updateSubscription } = useAuthStore()
  const [plans, setPlans] = useState<Plan[]>([])
  const [note, setNote] = useState('')
  const [selecting, setSelecting] = useState<string | null>(null)

  useEffect(() => {
    api.get('/api/v1/subscriptions/plans').then(r => {
      setPlans(r.data.data.plans)
      setNote(r.data.data.note)
    })
  }, [])

  async function selectPlan(planId: string) {
    setSelecting(planId)
    try {
      await api.post('/api/v1/subscriptions/select-plan', { plan: planId })
      updateSubscription({ status: 'pending_payment', plan: planId })
      navigate('/pending')
    } catch {
      setSelecting(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Choose your plan</h1>
          <p className="text-gray-500 mt-2">Select the plan that best fits your business</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.id} className="bg-white rounded-lg border shadow-sm p-6 flex flex-col gap-4">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{plan.productLimit.toLocaleString()} products</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{plan.shopLimit} shop{plan.shopLimit > 1 ? 's' : ''}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{plan.employeeLimit ?? 'Unlimited'} employees</span>
                {plan.creditModuleEnabled && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">Credit module</span>}
              </div>
              <ul className="text-sm text-gray-600 space-y-1 flex-1">
                {plan.features.map(f => <li key={f}>✓ {f}</li>)}
              </ul>
              <button
                onClick={() => selectPlan(plan.id)}
                disabled={selecting !== null}
                className="w-full h-10 rounded-md bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {selecting === plan.id ? 'Selecting…' : `Select ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        {note && <p className="text-center text-sm text-gray-400">{note}</p>}
      </div>
    </div>
  )
}
