import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Link } from 'react-router-dom'
import { PRICING } from '../../../lib/copyData'
import { Check, ArrowRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function PricingSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [annual, setAnnual] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      gsap.from('.pricing-reveal', {
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
    <section id="pricing" ref={sectionRef} className="py-24 md:py-32 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="pricing-reveal inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 mb-4">
            Pricing
          </span>
          <h2 className="pricing-reveal text-3xl sm:text-4xl font-bold text-slate-900">
            Simple, Transparent Pricing
          </h2>
        </div>

        {/* Toggle */}
        <div className="pricing-reveal flex justify-center mb-12">
          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                !annual
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                annual
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Annual
              <span className="ml-1 text-xs opacity-75">Save 2 months</span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PRICING.tiers.map((tier) => (
            <div
              key={tier.id}
              className={`pricing-reveal rounded-xl border bg-white shadow-sm flex flex-col ${
                tier.popular
                  ? 'border-indigo-200 ring-1 ring-indigo-100 md:-translate-y-2'
                  : 'border-slate-200/60'
              }`}
            >
              {/* Header */}
              <div className="p-6 pb-0">
                {tier.popular && tier.tag && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-600 text-white mb-3">
                    {tier.tag}
                  </span>
                )}
                {!tier.popular && tier.tag && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 mb-3">
                    {tier.tag}
                  </span>
                )}

                <h3 className="text-xl font-bold text-slate-900">
                  {tier.name}
                </h3>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">
                    GH₵{annual ? Math.round(tier.annualPrice / 12) : tier.monthlyPrice}
                  </span>
                  <span className="text-sm text-slate-400">/mo</span>
                </div>

                {annual && (
                  <p className="text-xs text-green-600 mt-1">
                    GH₵{tier.annualPrice.toLocaleString()}/yr - Save GH₵
                    {(tier.monthlyPrice * 12 - tier.annualPrice).toLocaleString()}
                  </p>
                )}

                <p className="text-xs text-slate-400 mt-2">{tier.limits}</p>

                {tier.smsCredits && (
                  <p className="text-xs text-indigo-600 font-medium mt-2">
                    {tier.smsCredits}
                  </p>
                )}
              </div>

              {/* Benefits */}
              <div className="p-6 flex-1">
                <ul className="space-y-3">
                  {tier.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2.5 text-sm">
                      <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span className="text-slate-600">{benefit}</span>
                    </li>
                  ))}
                </ul>

                {tier.rules && (
                  <p className="mt-4 text-[11px] text-slate-400 leading-relaxed border-t border-slate-100 pt-3">
                    {tier.rules}
                  </p>
                )}
              </div>

              {/* CTA */}
              <div className="p-6 pt-0">
                <Link
                  to="/signup"
                  className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
                    tier.popular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Start 14-Day Free Trial
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
