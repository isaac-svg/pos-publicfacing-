import { useState, useEffect } from 'react'
import { X, Check, Loader2, Zap, Star, Building2 } from 'lucide-react'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'

interface Plan {
  id: string; name: string; priceMonthly: number; priceAnnual: number
  shopLimit: number; employeeLimit: number | null; smsAllocation: number
  creditModuleEnabled: boolean; features: string[]; popular?: boolean; annualLabel: string
}

const PLAN_ICONS: Record<string, React.ReactNode> = {
  solo:   <Zap className="w-4 h-4" />,
  growth: <Star className="w-4 h-4" />,
  vip:    <Building2 className="w-4 h-4" />,
}

const PLAN_ACCENT: Record<string, string> = {
  solo:   'border-border bg-background',
  growth: 'border-primary/40 bg-primary/5',
  vip:    'border-amber-400/40 bg-amber-50',
}

const PLAN_BUTTON: Record<string, string> = {
  solo:   'bg-secondary text-secondary-foreground hover:bg-secondary/90',
  growth: 'bg-primary text-primary-foreground hover:bg-primary/90',
  vip:    'bg-amber-600 text-white hover:bg-amber-700',
}

function fmt(n: number) {
  return `GH₵${n.toLocaleString()}`
}

export function UpgradeModal({ onClose }: { onClose: () => void }) {
  const { subscription, updateSubscription } = useAuthStore()
  const [plans, setPlans] = useState<Plan[]>([])
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [selecting, setSelecting] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/v1/subscriptions/plans').then(r => {
      const all: Plan[] = r.data.data.plans
      setPlans(all.filter(p => p.id !== 'free'))
    })
  }, [])

  async function choosePlan(planId: string) {
    setSelecting(planId); setError('')
    try {
      await api.post('/api/v1/subscriptions/select-plan', { plan: planId, billingCycle: billing })
      updateSubscription({ status: 'pending_payment', plan: planId })
      const payRes = await api.post('/api/v1/subscriptions/initiate-payment')
      const { authorizationUrl } = payRes.data.data
      if (authorizationUrl) {
        window.location.href = authorizationUrl
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message
      setError(msg ?? 'Could not initiate payment. Please try again.')
      setSelecting(null)
    }
  }

  const currentPlan = subscription?.plan ?? 'free'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground">Choose your plan</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Upgrade to unlock all features. Cancel anytime.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center px-6 pt-5 pb-2">
          <div className="inline-flex items-center bg-muted rounded-full p-1">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${billing === 'monthly' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${billing === 'annual' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Annual
              <span className="ml-1.5 text-xs font-semibold text-emerald-600">Save 17%</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">{error}</div>
        )}

        {/* Plans grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6">
          {plans.map(plan => {
            const monthlyEquiv = billing === 'annual' ? Math.round(plan.priceAnnual / 12) : plan.priceMonthly
            const totalCharge  = billing === 'annual' ? plan.priceAnnual : plan.priceMonthly
            const savings      = plan.priceMonthly * 12 - plan.priceAnnual
            const isCurrent    = currentPlan === plan.id
            const isLoading    = selecting === plan.id

            return (
              <div
                key={plan.id}
                className={`relative rounded-xl border-2 p-5 flex flex-col gap-4 transition-all ${
                  plan.popular ? PLAN_ACCENT[plan.id] : 'border-border bg-background'
                } ${isCurrent ? 'ring-2 ring-primary/40' : ''}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-sm">
                    Most popular
                  </span>
                )}
                {isCurrent && (
                  <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
                    Current plan
                  </span>
                )}

                {/* Name + icon */}
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  plan.id === 'vip' ? 'bg-amber-600 text-white' :
                  plan.id === 'growth' ? 'bg-primary text-primary-foreground' :
                  'bg-muted text-muted-foreground'
                }`}>
                    {PLAN_ICONS[plan.id]}
                  </div>
                  <span className="font-bold text-foreground">{plan.name}</span>
                </div>

                {/* Price */}
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground">{fmt(monthlyEquiv)}</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                  {billing === 'annual' ? (
                    <p className="text-xs text-emerald-600 font-medium mt-0.5">
                      {fmt(totalCharge)}/yr · save {fmt(savings)}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-0.5">{plan.annualLabel}</p>
                  )}
                </div>

                {/* Key limits */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    `${plan.shopLimit} shop${plan.shopLimit !== 1 ? 's' : ''}`,
                    plan.employeeLimit ? `${plan.employeeLimit} staff` : 'Unlimited staff',
                    `${plan.smsAllocation.toLocaleString()} SMS`,
                  ].map(pill => (
                    <span key={pill} className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">{pill}</span>
                  ))}
                </div>

                {/* Features */}
                <ul className="space-y-1.5 flex-1">
                  {plan.features.slice(0, 5).map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                  {plan.features.length > 5 && (
                    <li className="text-xs text-muted-foreground pl-5">+{plan.features.length - 5} more</li>
                  )}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => choosePlan(plan.id)}
                  disabled={!!selecting || isCurrent}
                  className={`w-full h-10 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-muted text-muted-foreground cursor-default'
                      : PLAN_BUTTON[plan.id] ?? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isCurrent
                    ? 'Current plan'
                    : isLoading
                    ? 'Redirecting...'
                    : `Pay ${fmt(totalCharge)}${billing === 'annual' ? '/yr' : '/mo'}`
                  }
                </button>
              </div>
            )
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground px-6 pb-5">
          Secure payment via Paystack. You'll be redirected to complete payment and return automatically.
        </p>
      </div>
    </div>
  )
}
