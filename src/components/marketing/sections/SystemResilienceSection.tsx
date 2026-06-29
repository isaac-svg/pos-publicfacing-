import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import GlassCard from '../ui/GlassCard'
import SectionLabel from '../ui/SectionLabel'
import { SYSTEM_RESILIENCE } from '../../../lib/copyData'
import { WifiOff, Printer, Store, Shield, BarChart3, MessageSquare } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const iconMap: Record<string, React.ElementType> = {
  WifiOff, Printer, Store, Shield, BarChart3, MessageSquare,
}

export default function SystemResilienceSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.innerWidth < 768) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      if (headingRef.current) {
        gsap.from(headingRef.current.children, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        })
      }

      const cards = gridRef.current?.querySelectorAll('.feature-card')
      if (cards) {
        gsap.from(cards, {
          y: 60,
          opacity: 0,
          scale: 0.95,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        })
      }
    }, sectionRef.current)

    return () => ctx.revert()
  }, [])

  return (
    <section id="system-resilience" ref={sectionRef} className="relative py-24 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={headingRef} className="text-center mb-16">
          <SectionLabel>{SYSTEM_RESILIENCE.label}</SectionLabel>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            {SYSTEM_RESILIENCE.headline}
          </h2>
          <p className="text-lg text-[rgba(255,255,255,0.5)] max-w-2xl mx-auto">
            {SYSTEM_RESILIENCE.sub}
          </p>
        </div>

        <div
          ref={gridRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          {SYSTEM_RESILIENCE.features.map((feature) => {
            const Icon = iconMap[feature.icon] ?? BarChart3
            return (
              <GlassCard key={feature.title} className="feature-card" hover>
                <div className="w-10 h-10 rounded-lg bg-[rgba(99,102,241,0.15)] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#818cf8]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-[rgba(255,255,255,0.5)] leading-relaxed">{feature.description}</p>
              </GlassCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
