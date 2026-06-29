import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.innerWidth < 768) return

    const cursor = cursorRef.current
    if (!cursor) return

    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.3, ease: 'power2.out' })
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.3, ease: 'power2.out' })

    function onMove(e: MouseEvent) {
      xTo(e.clientX)
      yTo(e.clientY)
    }

    function onEnterInteractive() {
      cursor?.classList.add('scale-150', 'mix-blend-difference')
    }

    function onLeaveInteractive() {
      cursor?.classList.remove('scale-150', 'mix-blend-difference')
    }

    document.addEventListener('mousemove', onMove)

    const interactives = document.querySelectorAll('a, button, [role="button"]')
    interactives.forEach((el) => {
      el.addEventListener('mouseenter', onEnterInteractive)
      el.addEventListener('mouseleave', onLeaveInteractive)
    })

    return () => {
      document.removeEventListener('mousemove', onMove)
      interactives.forEach((el) => {
        el.removeEventListener('mouseenter', onEnterInteractive)
        el.removeEventListener('mouseleave', onLeaveInteractive)
      })
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-4 h-4 rounded-full bg-[#818cf8] pointer-events-none z-[9999] hidden md:block"
      style={{ transform: 'translate(-50%, -50%)' }}
    />
  )
}
