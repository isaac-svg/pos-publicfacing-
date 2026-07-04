import { useState } from 'react'
import { PILLARS } from '../../../lib/copyData'
import { Shield, ShieldCheck, Wifi, BarChart3, Receipt, Check } from 'lucide-react'

const pillarIcons = [Shield, ShieldCheck, Wifi, BarChart3, Receipt]

export default function PillarsSection() {
  const [active, setActive] = useState(0)

  return (
    <section id="pillars" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            The 5 Pillars of Control
          </h2>
        </div>

        {/* Tab bar */}
        <div className="flex overflow-x-auto border-b border-slate-200 mb-10 gap-0">
          {PILLARS.map((pillar, i) => {
            const Icon = pillarIcons[i]
            const isActive = active === i
            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => setActive(i)}
                className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap shrink-0"
                style={{
                  color: isActive ? '#4f46e5' : '#94a3b8',
                  borderBottomColor: isActive ? '#4f46e5' : 'transparent',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {pillar.title}
              </button>
            )
          })}
        </div>

        {/* Active panel */}
        <div className="min-h-[240px]">
          {PILLARS.map((pillar, i) => (
            <div
              key={pillar.id}
              className="transition-all duration-300"
              style={{ display: active === i ? 'block' : 'none' }}
            >
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-2xl font-bold text-slate-900">{pillar.title}</h3>
                {'badge' in pillar && pillar.badge && (
                  <span className="text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    {pillar.badge}
                  </span>
                )}
              </div>

              <div className="space-y-5">
                {pillar.features.map((f) => (
                  <div key={f.label} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{f.label}</p>
                      <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{f.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: vertical stack */}
        <div className="md:hidden mt-8 space-y-5">
          {PILLARS.map((pillar, i) => {
            const Icon = pillarIcons[i]
            return (
              <div key={pillar.id} className="rounded-xl border border-slate-200/80 bg-white p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-indigo-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">{pillar.title}</h3>
                  {'badge' in pillar && pillar.badge && (
                    <span className="text-[9px] font-medium bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full">
                      {pillar.badge}
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {pillar.features.map((f) => (
                    <div key={f.label} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{f.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{f.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
