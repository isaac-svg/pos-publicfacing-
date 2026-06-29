import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { Link } from 'react-router-dom'
import { HERO } from '../../../lib/copyData'
import { ArrowRight } from 'lucide-react'

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      gsap.from('.hero-animate', {
        y: 32,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
      })
    }, sectionRef.current)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[90vh] flex items-center pt-20"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="hero-animate text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.08]">
          {HERO.headline}
        </h1>

        <p className="hero-animate mt-6 text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          {HERO.subheadline}
        </p>

        <div className="hero-animate mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-indigo-600 text-white font-medium text-base shadow-sm hover:bg-indigo-700 hover:shadow-md transition-all"
          >
            {HERO.cta}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="hero-animate mt-4 text-sm text-slate-400">
          {HERO.ctaSubtext}
        </p>
      </div>
    </section>
  )
}
