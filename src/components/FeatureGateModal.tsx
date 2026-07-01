import { useState } from 'react'
import { Lock, X, Zap, Star, Building2, ArrowRight } from 'lucide-react'
import { UpgradeModal } from './UpgradeModal'

type PlanId = 'free' | 'solo' | 'growth' | 'vip'

export interface FeatureGateConfig {
  feature: string          // e.g. "Suppliers & Purchases"
  description: string      // e.g. "Track what you buy and from whom"
  requiredPlan: PlanId
  currentPlan: PlanId
}

const PLAN_LABELS: Record<PlanId, string> = {
  free:   'Free',
  solo:   'Solo Store',
  growth: 'Growth Engine',
  vip:    'Retail VIP Suite',
}

const PLAN_PRICES: Record<PlanId, string> = {
  free:   'Free',
  solo:   'GH₵99/mo',
  growth: 'GH₵169/mo',
  vip:    'GH₵259/mo',
}

const PLAN_ICONS: Record<PlanId, React.ReactNode> = {
  free:   <Lock className="w-5 h-5" />,
  solo:   <Zap className="w-5 h-5" />,
  growth: <Star className="w-5 h-5" />,
  vip:    <Building2 className="w-5 h-5" />,
}

const PLAN_COLOR: Record<PlanId, string> = {
  free:   'bg-muted text-muted-foreground',
  solo:   'bg-secondary text-secondary-foreground',
  growth: 'bg-primary text-primary-foreground',
  vip:    'bg-amber-500 text-white',
}

export function FeatureGateModal({
  config,
  onClose,
}: {
  config: FeatureGateConfig
  onClose: () => void
}) {
  const [showUpgrade, setShowUpgrade] = useState(false)

  if (showUpgrade) return <UpgradeModal onClose={onClose} />

  const { feature, description, requiredPlan } = config

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm p-6 space-y-5">
        {/* Icon */}
        <div className="flex items-start justify-between">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${PLAN_COLOR[requiredPlan]}`}>
            {PLAN_ICONS[requiredPlan]}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Text */}
        <div className="space-y-1.5">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            {feature}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {/* Required plan badge */}
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Available on</p>
            <p className="text-sm font-semibold text-foreground">{PLAN_LABELS[requiredPlan]} and above</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${PLAN_COLOR[requiredPlan]}`}>
            {PLAN_PRICES[requiredPlan]}
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={() => setShowUpgrade(true)}
          className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          View plans and upgrade
          <ArrowRight className="w-4 h-4" />
        </button>

        <button onClick={onClose} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
          Maybe later
        </button>
      </div>
    </div>
  )
}
