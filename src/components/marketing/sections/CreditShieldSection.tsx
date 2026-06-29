import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PhoneMockup from '../ui/PhoneMockup'
import SectionLabel from '../ui/SectionLabel'
import { CREDIT_SHIELD } from '../../../lib/copyData'

gsap.registerPlugin(ScrollTrigger)

export default function CreditShieldSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const msgsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.innerWidth < 768) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      if (leftRef.current) {
        gsap.from(leftRef.current.children, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: leftRef.current,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        })
      }

      if (rightRef.current) {
        gsap.from(rightRef.current, {
          x: -60,
          opacity: 0,
          duration: 1,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: rightRef.current,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        })
      }

      const msgs = msgsRef.current?.querySelectorAll('.sms-message')
      if (msgs) {
        gsap.from(msgs, {
          y: 30,
          opacity: 0,
          scale: 0.95,
          duration: 0.6,
          stagger: 0.25,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: msgsRef.current,
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div ref={leftRef}>
            <SectionLabel>{CREDIT_SHIELD.label}</SectionLabel>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              {CREDIT_SHIELD.headline}
            </h2>
            <p className="text-lg text-[rgba(255,255,255,0.5)] mb-8">
              {CREDIT_SHIELD.sub}
            </p>

            <div className="space-y-6">
              {CREDIT_SHIELD.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[rgba(99,102,241,0.15)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#818cf8] font-bold text-sm">{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{step.title}</h3>
                    <p className="text-sm text-[rgba(255,255,255,0.4)]">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div ref={rightRef} className="flex justify-center lg:justify-end">
            <PhoneMockup>
              <div className="p-2">
                <div className="text-center mb-4">
                  <p className="text-xs text-[rgba(255,255,255,0.4)]">Credit Shield</p>
                  <p className="text-xs text-[rgba(255,255,255,0.3)]">SMS Collection</p>
                </div>
                <div ref={msgsRef} className="space-y-3">
                  {CREDIT_SHIELD.messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`sms-message flex ${msg.sender === 'system' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                          msg.sender === 'system'
                            ? 'bg-[rgba(99,102,241,0.15)] text-[rgba(255,255,255,0.8)] rounded-tl-sm'
                            : 'bg-[#6366f1] text-white rounded-tr-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </PhoneMockup>
          </div>
        </div>
      </div>
    </section>
  )
}
