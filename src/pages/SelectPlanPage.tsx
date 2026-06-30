import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'

interface Plan {
  id: string; name: string; priceMonthly: number; priceAnnual: number
  productLimit: number | null; categoryLimit: number | null
  dailySalesLimit: number | null; shopLimit: number
  employeeLimit: number | null; smsAllocation: number
  creditModuleEnabled: boolean; features: string[]
  popular?: boolean; tagline: string; headline: string
  pills: { label: string }[]; annualLabel: string
}

interface SmsAddon {
  id: string; credits: number; price: number; description: string
}

export default function SelectPlanPage() {
  const navigate = useNavigate()
  const { updateSubscription, subscription } = useAuthStore()
  const [plans, setPlans] = useState<Plan[]>([])
  const [smsAddons, setSmsAddons] = useState<SmsAddon[]>([])
  const [trialDays, setTrialDays] = useState(14)
  const [selecting, setSelecting] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  useEffect(() => {
    api.get('/api/v1/subscriptions/plans').then(r => {
      setPlans(r.data.data.plans)
      setSmsAddons(r.data.data.smsAddons ?? [])
      setTrialDays(r.data.data.trialDays ?? 14)
    })
  }, [])

  function getPrice(plan: Plan) {
    if (billingCycle === 'annual') {
      return { display: Math.round(plan.priceAnnual / 12), total: plan.priceAnnual, suffix: '/mo' }
    }
    return { display: plan.priceMonthly, total: plan.priceMonthly, suffix: '/mo' }
  }

  async function selectPlan(planId: string) {
    setSelecting(planId)
    setError('')
    try {
      const res = await api.post('/api/v1/subscriptions/select-plan', { plan: planId, billingCycle })
      const newStatus = res.data.data.status
      updateSubscription({ status: newStatus, plan: planId })

      if (newStatus === 'trial') {
        navigate('/dashboard')
        return
      }

      const payRes = await api.post('/api/v1/subscriptions/initiate-payment')
      const { authorizationUrl } = payRes.data.data

      if (authorizationUrl) {
        window.location.href = authorizationUrl
      } else {
        navigate('/pending')
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Failed to process plan selection'
      setError(msg)
      setSelecting(null)
    }
  }

  const alreadyOnPaidPlan = subscription?.status === 'pending_payment' || subscription?.status === 'active'

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Choose your plan</h1>
          <p className="text-muted-foreground">Start with a free trial — no card required</p>

          {/* Billing toggle */}
          <div className="inline-flex items-center bg-muted rounded-full p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                billingCycle === 'monthly' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                billingCycle === 'annual' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annual <span className="text-accent-foreground text-xs font-semibold ml-1">Save 17%</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-md px-4 py-3">{error}</div>
        )}

        {alreadyOnPaidPlan && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
            You already have a plan selected. <button onClick={() => navigate('/pending')} className="underline font-medium">Check payment status</button>
          </div>
        )}

        <div className="bg-muted border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3 text-sm text-amber-800">
          <span className="text-lg">🎁</span>
          <span>Start with a <strong>{trialDays}-day free trial</strong> — every feature unlocked, no card required. After {trialDays} days you move to the Free plan automatically.</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {plans.map(plan => {
            const popular = plan.popular
            const isFree = plan.priceMonthly === 0
            const price = getPrice(plan)
            return (
              <div key={plan.id} className={`bg-card rounded-lg border ${popular ? 'border-blue-400 ring-1 ring-blue-400' : 'border-border'} shadow-sm p-4 flex flex-col gap-3 relative`}>
                {popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-0.5 rounded-full">Most popular</span>
                )}
                <div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    plan.id === 'free' ? 'bg-muted text-muted-foreground' :
                    plan.id === 'growth' ? 'bg-blue-50 text-blue-700' :
                    plan.id === 'pro' ? 'bg-emerald-50 text-accent-foreground' :
                    'bg-muted text-foreground'
                  }`}>{plan.name}</span>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-semibold">
                    GH₵ {price.display}<span className="text-sm font-normal text-muted-foreground">{price.suffix}</span>
                  </div>
                  {!isFree && billingCycle === 'annual' && (
                    <p className="text-xs text-accent-foreground font-medium">
                      GH₵ {plan.priceAnnual.toLocaleString()}/yr — save GH₵ {(plan.priceMonthly * 12 - plan.priceAnnual).toLocaleString()}
                    </p>
                  )}
                  {!isFree && billingCycle === 'monthly' && plan.priceAnnual > 0 && (
                    <p className="text-xs text-muted-foreground">{plan.annualLabel}</p>
                  )}
                  {isFree && <p className="text-xs text-muted-foreground">Free forever after trial</p>}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{plan.headline}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{plan.tagline}</p>
                <div className="flex flex-wrap gap-1.5">
                  {plan.pills.map(pill => (
                    <span key={pill.label} className="text-xs bg-muted text-foreground px-2 py-0.5 rounded">{pill.label}</span>
                  ))}
                </div>
                <hr className="border-gray-100" />
                <ul className="text-xs text-muted-foreground space-y-1 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => selectPlan(plan.id)}
                  disabled={selecting !== null}
                  className={`w-full h-9 rounded-md text-sm font-medium transition disabled:opacity-50 ${
                    popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'border border-gray-300 text-foreground hover:bg-background'
                  }`}
                >
                  {selecting === plan.id
                    ? isFree ? 'Starting…' : 'Redirecting to payment…'
                    : isFree
                      ? 'Start Free Trial'
                      : `Pay GH₵ ${price.total.toLocaleString()} — ${plan.name}`
                  }
                </button>
              </div>
            )
          })}
        </div>

        {smsAddons.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">SMS add-ons — Growth and above</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {smsAddons.map(addon => (
                <div key={addon.id} className="bg-card rounded-lg border border-border p-3">
                  <p className="text-sm font-semibold">{addon.credits.toLocaleString()} SMS</p>
                  <p className="text-xs text-muted-foreground">{addon.description}</p>
                  <p className="text-sm font-semibold text-blue-600 mt-1">GH₵ {addon.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-background border border-border rounded-lg p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-gray-200 flex items-center justify-center text-muted-foreground text-lg shrink-0">🏢</div>
            <div>
              <p className="text-sm font-semibold">Enterprise — custom pricing</p>
              <p className="text-xs text-muted-foreground">Unlimited shops, custom SMS volumes, SLA agreement, multi-tenant architecture, and dedicated engineering support.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground"><span className="text-emerald-500">✓</span> Unlimited shops</span>
            <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground"><span className="text-emerald-500">✓</span> Custom SMS</span>
            <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground"><span className="text-emerald-500">✓</span> SLA</span>
          </div>
        </div>
      </div>
    </div>
  )
}
