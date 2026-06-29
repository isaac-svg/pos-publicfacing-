import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import GlowButton from '../ui/GlowButton'
import GradientMesh from '../ui/GradientMesh'
import { FINAL_CTA } from '../../../lib/copyData'

gsap.registerPlugin(ScrollTrigger)

export default function FinalCTASection() {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.innerWidth < 768) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      if (contentRef.current) {
        gsap.from(contentRef.current.children, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none none',
          },
        })
      }
    }, sectionRef.current)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 overflow-hidden">
      <GradientMesh />
      <div ref={contentRef} className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="inline-block text-sm font-semibold tracking-[0.2em] uppercase text-[#6366f1] mb-4">
          {FINAL_CTA.label}
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
          {FINAL_CTA.headline}
        </h2>
        <p className="text-lg text-[rgba(255,255,255,0.5)] mb-8 max-w-xl mx-auto">
          {FINAL_CTA.sub}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <GlowButton href="/signup" className="text-base !px-10 !py-4">
            {FINAL_CTA.cta}
          </GlowButton>
        </div>
        <p className="text-sm text-[rgba(255,255,255,0.3)] mt-4">
          {FINAL_CTA.secondaryText}
        </p>
      </div>
    </section>
  )
}
