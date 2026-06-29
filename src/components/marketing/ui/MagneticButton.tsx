import { useRef, useCallback, type ReactNode } from 'react'

interface MagneticButtonProps {
  children: ReactNode
  strength?: number
}

export default function MagneticButton({ children, strength = 0.3 }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current || window.innerWidth < 768) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const deltaX = (e.clientX - centerX) * strength
    const deltaY = (e.clientY - centerY) * strength
    ref.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`
    ref.current.style.transition = 'transform 0.3s cubic-bezier(0.33, 1, 0.68, 1)'
  }, [strength])

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return
    ref.current.style.transform = 'translate(0, 0)'
  }, [])

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      {children}
    </div>
  )
}
