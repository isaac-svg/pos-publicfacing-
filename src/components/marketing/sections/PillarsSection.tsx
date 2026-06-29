import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PILLARS } from '../../../lib/copyData'
import { Shield, ShieldCheck, Wifi, BarChart3, Receipt, Check } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const pillarIcons = [Shield, ShieldCheck, Wifi, BarChart3, Receipt]

export default function PillarsSection() {
  const containerRef = useRef<HTMLElement>(null)
  const pinnedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.innerWidth < 768) {
      if (!containerRef.current) return
      const ctx = gsap.context(() => {
        gsap.from('.pillar-card-mobile', {
          y: 24,
          opacity: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        })
      }, containerRef.current)
      return () => ctx.revert()
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!containerRef.current || !pinnedRef.current) return

    const ctx = gsap.context(() => {
      let currentIndex = 0
      const tabs = gsap.utils.toArray<HTMLElement>('.pillar-tab')
      const panels = gsap.utils.toArray<HTMLElement>('.pillar-panel')

      panels.forEach((p, i) => {
        if (i !== 0) gsap.set(p, { opacity: 0, y: 12 })
      })

      function setActive(idx: number) {
        if (idx === currentIndex) return
        currentIndex = idx
        tabs.forEach((t, i) => {
          gsap.to(t, {
            color: i === idx ? '#4f46e5' : '#94a3b8',
            borderBottomColor: i === idx ? '#4f46e5' : 'transparent',
            duration: 0.25,
          })
        })
        panels.forEach((p, i) => {
          gsap.to(p, {
            opacity: i === idx ? 1 : 0,
            y: i === idx ? 0 : 12,
            duration: 0.35,
            ease: 'power2.out',
            pointerEvents: i === idx ? 'auto' : 'none',
          })
        })
      }

      gsap.from('.pillars-heading', {
        y: 24,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      })

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: '+=400%',
        pin: pinnedRef.current,
        pinSpacing: true,
        onUpdate: (self) => {
          const idx = Math.min(4, Math.floor(self.progress * 5))
          setActive(idx)
        },
      })
    }, containerRef.current)

    return () => ctx.revert()
  }, [])

  return (
    <section id="pillars" ref={containerRef} className="relative">
      {/* Desktop: Pinned scroll tabs */}
      <div ref={pinnedRef} className="hidden md:flex min-h-screen items-center">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
          <div className="text-center mb-10 pillars-heading">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 mb-4">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              The 5 Pillars of Control
            </h2>
          </div>

          {/* Tab bar */}
          <div className="flex overflow-x-auto border-b border-slate-200 mb-10 -mx-1">
            {PILLARS.map((pillar, i) => {
              const Icon = pillarIcons[i]
              return (
                <div
                  key={pillar.id}
                  className="pillar-tab flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap"
                  style={{
                    color: i === 0 ? '#4f46e5' : '#94a3b8',
                    borderBottomColor: i === 0 ? '#4f46e5' : 'transparent',
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {pillar.title}
                </div>
              )
            })}
          </div>

          {/* Content panels */}
          <div className="relative min-h-[260px]">
            {PILLARS.map((pillar, i) => (
              <div
                key={pillar.id}
                className={`pillar-panel ${i === 0 ? '' : 'absolute inset-0'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-slate-900">
                    {pillar.title}
                  </h3>
                  {'badge' in pillar && pillar.badge && (
                    <span className="text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full">
                      {pillar.badge}
                    </span>
                  )}
                </div>

                <div className="mt-6 space-y-5">
                  {pillar.features.map((f) => (
                    <div key={f.label} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{f.label}</p>
                        <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">
                          {f.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: Vertical stack */}
      <div className="md:hidden py-20 px-4">
        <div className="text-center mb-10">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 mb-4">
            Features
          </span>
          <h2 className="text-3xl font-bold text-slate-900">
            The 5 Pillars of Control
          </h2>
        </div>

        <div className="space-y-5 max-w-lg mx-auto">
          {PILLARS.map((pillar, i) => {
            const Icon = pillarIcons[i]
            return (
              <div
                key={pillar.id}
                className="pillar-card-mobile rounded-xl border border-slate-200/80 bg-white p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-indigo-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {pillar.title}
                  </h3>
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
                        <p className="text-sm font-medium text-slate-900">
                          {f.label}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {f.description}
                        </p>
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
