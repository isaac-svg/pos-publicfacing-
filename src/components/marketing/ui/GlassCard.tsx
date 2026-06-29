import { type ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  featured?: boolean
  className?: string
  hover?: boolean
}

export default function GlassCard({ children, featured, className = '', hover }: GlassCardProps) {
  return (
    <div
      className={`${featured ? 'glass-card-featured' : 'glass-card'} p-6 ${hover ? 'transition-transform duration-300 hover:-translate-y-1' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
