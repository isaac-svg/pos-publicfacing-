import { type ReactNode } from 'react'

interface PhoneMockupProps {
  children: ReactNode
  className?: string
}

export default function PhoneMockup({ children, className = '' }: PhoneMockupProps) {
  return (
    <div className={`relative mx-auto w-[280px] md:w-[320px] ${className}`}>
      {/* Phone frame */}
      <div className="relative rounded-[2.5rem] border-2 border-[rgba(255,255,255,0.1)] bg-[#0e0e12] p-3 shadow-[0_0_60px_rgba(99,102,241,0.1)]">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-[#0e0e12] rounded-b-2xl z-10" />
        {/* Screen */}
        <div className="rounded-[2rem] bg-[#060608] overflow-hidden min-h-[480px] pt-8 px-4 pb-4">
          {children}
        </div>
      </div>
      {/* Home indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[100px] h-[4px] bg-[rgba(255,255,255,0.15)] rounded-full" />
    </div>
  )
}
