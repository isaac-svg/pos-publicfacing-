import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CLARITY_GRID } from '../../../lib/copyData'
import { ArrowRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function ClarityGridSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      gsap.from('.clarity-reveal', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      })
    }, sectionRef.current)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 md:py-32 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="clarity-reveal inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 mb-4">
            Rapid Clarity
          </span>
          <h2 className="clarity-reveal text-3xl sm:text-4xl font-bold text-slate-900">
            Retail Realities vs. Our Fixes
          </h2>
        </div>

        <div className="clarity-reveal rounded-xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center px-6 py-3 bg-slate-50 border-b border-slate-200/60 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span>The Problem</span>
            <span className="px-4" />
            <span>Our Fix</span>
          </div>

          {/* Rows */}
          {CLARITY_GRID.rows.map((row, i) => (
            <div
              key={row.problem}
              className={`clarity-reveal px-6 py-5 ${
                i < CLARITY_GRID.rows.length - 1
                  ? 'border-b border-slate-200/60'
                  : ''
              }`}
            >
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <span className="text-sm font-medium text-red-600">
                  {row.problem}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-300 mx-2" />
                <span className="text-sm font-medium text-indigo-600">
                  {row.solution}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                {row.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
