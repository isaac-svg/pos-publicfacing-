import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface GlowButtonProps {
  children: ReactNode
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  className?: string
}

export default function GlowButton({ children, href, onClick, variant = 'primary', className = '' }: GlowButtonProps) {
  const baseClasses = 'relative inline-flex items-center justify-center px-8 py-3.5 rounded-full font-medium text-sm transition-all duration-300 will-animate'

  const variantClasses = variant === 'primary'
    ? 'bg-[#6366f1] text-white hover:bg-[#818cf8] shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)]'
    : 'bg-transparent text-[#94a3b8] border border-[rgba(255,255,255,0.1)] hover:border-[rgba(99,102,241,0.4)] hover:text-white'

  const classes = `${baseClasses} ${variantClasses} ${className}`

  if (href) {
    if (href.startsWith('#')) {
      return (
        <button
          onClick={() => {
            const el = document.querySelector(href)
            el?.scrollIntoView({ behavior: 'smooth' })
          }}
          className={classes}
        >
          {children}
        </button>
      )
    }
    return (
      <Link to={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  )
}
