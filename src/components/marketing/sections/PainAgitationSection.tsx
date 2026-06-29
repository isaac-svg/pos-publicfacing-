import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import GlassCard from '../ui/GlassCard'
import SectionLabel from '../ui/SectionLabel'
import { PAIN_SECTION } from '../../../lib/copyData'
import { ShieldOff, CreditCard, Package } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const iconMap: Record<string, React.ElementType> = { ShieldOff, CreditCard, Package }

export default function PainAgitationSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)

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

      if (trackRef.current && sectionRef.current) {
        const track = trackRef.current
        const section = sectionRef.current
        const viewportWidth = window.innerWidth
        const trackWidth = track.scrollWidth

        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: () => `+=${trackWidth - viewportWidth + 400}`,
          pin: true,
          pinSpacing: true,
          scrub: 1.5,
          onUpdate: (self) => {
            const maxX = Math.max(0, trackWidth - viewportWidth)
            gsap.set(track, { x: -self.progress * maxX })
          },
        })
      }
    }, sectionRef.current)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="pain-agitation"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#060608]"
      style={{ minHeight: '100vh' }}
    >
      <div ref={headingRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <SectionLabel>{PAIN_SECTION.label}</SectionLabel>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
          {PAIN_SECTION.headline}
        </h2>
        <p className="text-lg text-[rgba(255,255,255,0.5)] max-w-2xl">
          {PAIN_SECTION.sub}
        </p>
      </div>

      <div ref={trackRef} className="flex gap-6 px-4 sm:px-6 lg:px-8 pb-24" style={{ width: 'max-content' }}>
        {PAIN_SECTION.cards.map((card) => {
          const Icon = iconMap[card.icon] ?? Package
          return (
            <GlassCard key={card.title} className="w-[380px] flex-shrink-0" hover>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[rgba(99,102,241,0.15)] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#818cf8]" />
                </div>
                <h3 className="text-xl font-bold text-white">{card.title}</h3>
              </div>
              <div className="text-3xl font-bold text-[#ef4444] mb-3">{card.stat}</div>
              <p className="text-[rgba(255,255,255,0.5)] leading-relaxed">{card.description}</p>
            </GlassCard>
          )
        })}
      </div>
    </section>
  )
}
