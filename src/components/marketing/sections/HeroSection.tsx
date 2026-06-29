import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import GlowButton from '../ui/GlowButton'
import GradientMesh from '../ui/GradientMesh'
import MagneticButton from '../ui/MagneticButton'
import { HERO } from '../../../lib/copyData'

gsap.registerPlugin(ScrollTrigger)

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const mockupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.innerWidth < 768) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      if (headlineRef.current) {
        const words = headlineRef.current.querySelectorAll('span')
        tl.from(words, {
          y: 60,
          opacity: 0,
          duration: 0.8,
          stagger: 0.04,
        }, 0)
      }

      if (subRef.current) {
        tl.from(subRef.current, {
          y: 30,
          opacity: 0,
          duration: 0.8,
        }, 0.6)
      }

      if (ctaRef.current) {
        tl.from(ctaRef.current.children, {
          y: 20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.15,
        }, 0.9)
      }

      if (mockupRef.current) {
        tl.from(mockupRef.current, {
          y: 100,
          opacity: 0,
          rotation: 5,
          duration: 1.2,
          ease: 'power4.out',
        }, 0.3)
      }
    }, sectionRef.current)

    return () => ctx.revert()
  }, [])

  function scrollToPain() {
    const el = document.getElementById('pain-agitation')
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden pt-20"
    >
      <GradientMesh />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(99,102,241,0.3)] bg-[rgba(99,102,241,0.1)] text-[#818cf8] text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8] animate-pulse" />
              Shepherd POS
            </div>

            <h1
              ref={headlineRef}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white mb-6"
            >
              {HERO.headline.split(' ').map((word, i) => (
                <span key={i} className="inline-block mr-[0.3em]">{word}</span>
              ))}
            </h1>

            <p ref={subRef} className="text-lg md:text-xl text-[rgba(255,255,255,0.5)] max-w-xl mx-auto lg:mx-0 mb-8">
              {HERO.sub}
            </p>

            <div ref={ctaRef} className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <MagneticButton>
                <GlowButton href="/signup" className="text-base">
                  {HERO.cta}
                </GlowButton>
              </MagneticButton>
              <GlowButton variant="secondary" onClick={scrollToPain} className="text-base">
                {HERO.ctaSecondary}
              </GlowButton>
            </div>
          </div>

          <div ref={mockupRef} className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-[rgba(99,102,241,0.15)] to-transparent rounded-2xl" />
              <img
                src="/src/assets/hero.png"
                alt="Shepherd POS Dashboard"
                className="w-full rounded-2xl shadow-2xl border border-[rgba(255,255,255,0.06)]"
                onError={(e) => {
                  const t = e.currentTarget
                  t.style.display = 'none'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
        </svg>
      </div>
    </section>
  )
}
