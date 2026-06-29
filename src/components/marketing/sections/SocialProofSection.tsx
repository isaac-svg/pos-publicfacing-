import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import CountUp from '../ui/CountUp'
import { SOCIAL_PROOF } from '../../../lib/copyData'

gsap.registerPlugin(ScrollTrigger)

export default function SocialProofSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

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
            trigger: sectionRef.current,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        })
      }
    }, sectionRef.current)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (SOCIAL_PROOF.testimonials.length < 2) return
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % SOCIAL_PROOF.testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={headingRef} className="text-center mb-16">
          <span className="inline-block text-sm font-semibold tracking-[0.2em] uppercase text-[#6366f1] mb-4">
            {SOCIAL_PROOF.label}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            {SOCIAL_PROOF.headline}
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-8 mb-20 max-w-2xl mx-auto">
          {SOCIAL_PROOF.stats.map((stat) => (
            <CountUp
              key={stat.label}
              end={stat.end}
              suffix={stat.suffix}
              label={stat.label}
            />
          ))}
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative min-h-[200px]">
            {SOCIAL_PROOF.testimonials.map((t, i) => (
              <div
                key={i}
                className={`transition-all duration-700 absolute inset-0 ${
                  i === active
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 translate-x-8 pointer-events-none'
                }`}
              >
                <div className="glass-card p-8 md:p-10 text-center">
                  <svg className="w-8 h-8 text-[#6366f1] mx-auto mb-6 opacity-50" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <p className="text-lg md:text-xl text-[rgba(255,255,255,0.8)] mb-6 leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div>
                    <p className="text-white font-semibold">{t.name}</p>
                    <p className="text-sm text-[rgba(255,255,255,0.4)]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {SOCIAL_PROOF.testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === active ? 'bg-[#6366f1] w-6' : 'bg-[rgba(255,255,255,0.2)]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
