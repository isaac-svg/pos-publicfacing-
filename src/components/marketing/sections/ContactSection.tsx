import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { publicApi } from '../../../lib/api'
import { Send, Check, Loader2, Phone, User, MessageSquare } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [form, setForm] = useState({ name: '', phone: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      gsap.from('.contact-reveal', {
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) return

    setStatus('loading')
    setErrorMsg('')
    try {
      await publicApi.submitContact({
        name: form.name.trim(),
        phone: form.phone.trim(),
        message: form.message.trim(),
      })
      setStatus('success')
      setForm({ name: '', phone: '', message: '' })
    } catch (err: unknown) {
      setStatus('error')
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? 'Something went wrong. Please try again.'
      setErrorMsg(msg)
    }
  }

  return (
    <section id="contact" ref={sectionRef} className="py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left: Info */}
          <div>
            <span className="contact-reveal inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 mb-4">
              Contact Us
            </span>
            <h2 className="contact-reveal text-2xl sm:text-3xl font-bold text-slate-900">
              Enterprise &amp; Custom Solutions
            </h2>
            <p className="contact-reveal mt-3 text-sm text-slate-500 leading-relaxed">
              Need a tailored retail system for multiple branches, a custom integration, or bespoke software built for your business? We build it. Drop your details and we'll get back to you within minutes.
            </p>

            <div className="contact-reveal mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Quick Response</p>
                  <p className="text-xs text-slate-500">We get notified instantly when you reach out.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Real Humans</p>
                  <p className="text-xs text-slate-500">No chatbots. A real team member will get back to you.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="contact-reveal">
            {status === 'success' ? (
              <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
                <div className="mx-auto w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-base font-semibold text-green-900">Message Sent!</h3>
                <p className="mt-2 text-sm text-green-700">
                  Thank you for reaching out. Our team has been notified and will get back to you shortly.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-4 text-sm font-medium text-green-700 hover:text-green-800 underline underline-offset-2"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="contact-name" className="text-sm font-medium text-slate-700">
                    Your name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Kwame Mensah"
                      className="w-full h-10 rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="contact-phone" className="text-sm font-medium text-slate-700">
                    Phone number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      placeholder="e.g. 024 123 4567"
                      className="w-full h-10 rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="contact-message" className="text-sm font-medium text-slate-700">
                    Your message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Tell us how we can help…"
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors resize-none"
                  />
                </div>

                {status === 'error' && (
                  <p className="text-xs text-red-500">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
                >
                  {status === 'loading' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
