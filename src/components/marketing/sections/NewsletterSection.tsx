import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { publicApi } from '../../../lib/api'
import { ArrowRight, Check, Loader2 } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function NewsletterSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      gsap.from('.newsletter-reveal', {
        y: 20,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      })
    }, sectionRef.current)

    return () => ctx.revert()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    setErrorMsg('')
    try {
      await publicApi.subscribeNewsletter({ email: email.trim() })
      setStatus('success')
      setEmail('')
    } catch (err: unknown) {
      setStatus('error')
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? 'Something went wrong. Please try again.'
      setErrorMsg(msg)
    }
  }

  return (
    <section ref={sectionRef} className="py-20 md:py-28 bg-slate-50/50">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="newsletter-reveal inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 mb-4">
          Newsletter
        </span>
        <h2 className="newsletter-reveal text-2xl sm:text-3xl font-bold text-slate-900">
          Free Tips to Run Your Shop Smarter
        </h2>
        <p className="newsletter-reveal mt-3 text-sm text-slate-500 max-w-md mx-auto">
          Subscribe to receive free tips, strategies, and insights on how to efficiently run your retail business — straight to your inbox.
        </p>

        {status === 'success' ? (
          <div className="newsletter-reveal mt-8 inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-5 py-3 text-sm font-medium text-green-700">
            <Check className="w-4 h-4" />
            You're subscribed! Check your inbox soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="newsletter-reveal mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {status === 'loading' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Subscribe
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="mt-3 text-xs text-red-500">{errorMsg}</p>
        )}

        <p className="newsletter-reveal mt-4 text-xs text-slate-400">
          No spam, ever. Unsubscribe anytime.
        </p>
      </div>
    </section>
  )
}
