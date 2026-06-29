import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Link } from 'react-router-dom'
import { TRIAL_OFFER } from '../../../lib/copyData'
import { Unlock, Upload, GraduationCap, ArrowRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const stackIcons = [Unlock, Upload, GraduationCap]

export default function TrialOfferSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      gsap.from('.trial-reveal', {
        y: 24,
        opacity: 0,
        duration: 0.7,
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
    <section ref={sectionRef} className="py-24 md:py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="trial-reveal text-3xl sm:text-4xl font-bold text-slate-900">
          {TRIAL_OFFER.headline}
        </h2>

        <div className="trial-reveal mt-12 grid sm:grid-cols-3 gap-6 text-left">
          {TRIAL_OFFER.stack.map((item, i) => {
            const Icon = stackIcons[i]
            return (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center mb-3">
                  <Icon className="w-4.5 h-4.5 text-indigo-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            )
          })}
        </div>

        <div className="trial-reveal mt-10">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-indigo-600 text-white font-medium text-base shadow-sm hover:bg-indigo-700 hover:shadow-md transition-all"
          >
            {TRIAL_OFFER.cta}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="mt-3 text-sm text-slate-400">{TRIAL_OFFER.ctaSubtext}</p>
        </div>
      </div>
    </section>
  )
}
