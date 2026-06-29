import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FAQ } from '../../../lib/copyData'
import { ChevronDown } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

function AccordionItem({
  question,
  answer,
}: {
  question: string
  answer: string
}) {
  const [open, setOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <div className="border-b border-slate-200/60">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-5 text-left group"
      >
        <span className="text-sm font-medium text-slate-900 pr-4 group-hover:text-indigo-600 transition-colors">
          {question}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? contentRef.current?.scrollHeight ?? 200 : 0 }}
      >
        <p className="pb-5 text-sm text-slate-500 leading-relaxed pr-8">
          {answer}
        </p>
      </div>
    </div>
  )
}

export default function FAQSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      gsap.from('.faq-reveal', {
        y: 20,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
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
    <section id="faq" ref={sectionRef} className="py-24 md:py-32">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="faq-reveal inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 mb-4">
            FAQ
          </span>
          <h2 className="faq-reveal text-3xl sm:text-4xl font-bold text-slate-900">
            Common Objections, Handled
          </h2>
        </div>

        <div className="faq-reveal rounded-xl border border-slate-200/60 bg-white shadow-sm px-6">
          {FAQ.items.map((item) => (
            <AccordionItem
              key={item.question}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
