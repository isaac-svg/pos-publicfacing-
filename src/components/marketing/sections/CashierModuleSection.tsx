import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import GlassCard from '../ui/GlassCard'
import SectionLabel from '../ui/SectionLabel'
import { CASHIER_MODULE } from '../../../lib/copyData'

gsap.registerPlugin(ScrollTrigger)

export default function CashierModuleSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const stagesRef = useRef<HTMLDivElement>(null)

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

      const stages = stagesRef.current?.querySelectorAll('.cashier-stage')
      if (stages) {
        stages.forEach((stage) => {
          gsap.from(stage, {
            y: 60,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: stage,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          })

          gsap.to(stage, {
            scale: 0.97,
            opacity: 0.5,
            ease: 'power1.out',
            scrollTrigger: {
              trigger: stage,
              start: 'top 30%',
              end: 'top 10%',
              scrub: 1,
            },
          })
        })
      }
    }, sectionRef.current)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={headingRef} className="text-center mb-16">
          <SectionLabel>{CASHIER_MODULE.label}</SectionLabel>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            {CASHIER_MODULE.headline}
          </h2>
          <p className="text-lg text-[rgba(255,255,255,0.5)] max-w-2xl mx-auto">
            {CASHIER_MODULE.sub}
          </p>
        </div>

        <div ref={stagesRef} className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {CASHIER_MODULE.stages.map((stage, i) => (
            <GlassCard key={i} className="cashier-stage" hover>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#6366f1] flex items-center justify-center text-white font-bold text-sm">
                  {i + 1}
                </div>
                <h3 className="text-lg font-bold text-white">{stage.title}</h3>
              </div>
              <p className="text-[rgba(255,255,255,0.6)] mb-3">{stage.description}</p>
              <p className="text-sm text-[rgba(255,255,255,0.35)]">{stage.detail}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}
