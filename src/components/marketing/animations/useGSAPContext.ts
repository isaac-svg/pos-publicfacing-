import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export function useGSAPContext(callback: (ctx: gsap.Context) => void, deps: unknown[] = []) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    if (window.innerWidth < 768) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      callback(ctx)
    }, ref.current)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ref
}
