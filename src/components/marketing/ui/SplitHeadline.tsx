import { useRef, useEffect, type ElementType } from 'react'
import { gsap } from '../animations/registerPlugins'
import { splitIntoWords, revertSplit } from '../animations/splitText'
import { EASE_BACK, DURATION_MEDIUM } from '../../../lib/animationConstants'

interface SplitHeadlineProps {
  text: string
  tag?: ElementType
  className?: string
  trigger?: 'mount' | 'scroll'
  delay?: number
}

export default function SplitHeadline({ text, tag: Tag = 'h2', className = '', trigger = 'scroll', delay = 0 }: SplitHeadlineProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.innerWidth < 768) return

    const el = ref.current
    const originalText = el.textContent ?? ''
    const words = splitIntoWords(el)

    const ctx = gsap.context(() => {
      if (trigger === 'mount') {
        gsap.from(words, {
          y: 80,
          opacity: 0,
          rotateX: -30,
          stagger: 0.07,
          duration: DURATION_MEDIUM + 0.1,
          delay,
          ease: EASE_BACK,
        })
      } else {
        gsap.from(words, {
          y: 60,
          opacity: 0,
          stagger: 0.06,
          duration: DURATION_MEDIUM,
          ease: EASE_BACK,
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        })
      }
    })

    return () => {
      ctx.revert()
      revertSplit(el, originalText)
    }
  }, [text, trigger, delay])

  return <Tag ref={ref} className={`will-animate ${className}`}>{text}</Tag>
}
