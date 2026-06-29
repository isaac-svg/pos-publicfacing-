import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PROBLEM } from '../../../lib/copyData'
import { CircleDollarSign, Clock, WifiOff } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const icons = [CircleDollarSign, Clock, WifiOff]

export default function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      gsap.from('.problem-reveal', {
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
    <section ref={sectionRef} className="py-24 md:py-32 bg-slate-50/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="problem-reveal inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 mb-4">
            The Problem
          </span>
          <h2 className="problem-reveal text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
            The 3 Silent Profit Killers
          </h2>
          <p className="problem-reveal mt-4 text-base text-slate-500 max-w-lg mx-auto">
            {PROBLEM.anchor}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {PROBLEM.killers.map((killer, i) => {
            const Icon = icons[i]
            return (
              <div
                key={killer.id}
                className="problem-reveal group relative rounded-xl border border-slate-200/80 bg-white p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-5">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-50 border border-slate-100">
                    <Icon className="w-4.5 h-4.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">
                  {killer.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {killer.description}
                </p>
              </div>
            )
          })}
        </div>

        <div className="problem-reveal mt-10 text-center">
          <p className="inline-block text-sm font-medium text-slate-600 border border-slate-200/80 rounded-lg px-5 py-3 bg-white shadow-sm">
            {PROBLEM.callout}
          </p>
        </div>
      </div>
    </section>
  )
}
