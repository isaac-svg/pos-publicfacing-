import { useRef, useEffect, useState } from 'react'
import { gsap, ScrollTrigger } from '../animations/registerPlugins'

interface CountUpProps {
  end: number
  prefix?: string
  suffix?: string
  duration?: number
  label: string
}

export default function CountUp({ end, prefix = '', suffix = '', duration = 2, label }: CountUpProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [display, setDisplay] = useState(`${prefix}0${suffix}`)

  useEffect(() => {
    if (!ref.current) return

    const obj = { val: 0 }

    const trigger = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: end,
          duration,
          ease: 'power2.out',
          onUpdate: () => {
            const v = end % 1 !== 0 ? obj.val.toFixed(1) : Math.round(obj.val).toString()
            setDisplay(`${prefix}${v}${suffix}`)
          },
        })
      },
    })

    return () => trigger.kill()
  }, [end, prefix, suffix, duration])

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-white mb-2">{display}</div>
      <div className="text-sm text-[#94a3b8]">{label}</div>
    </div>
  )
}
