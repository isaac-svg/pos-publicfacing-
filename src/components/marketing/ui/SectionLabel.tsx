interface SectionLabelProps {
  children: React.ReactNode
}

export default function SectionLabel({ children }: SectionLabelProps) {
  return (
    <span className="inline-block text-sm font-semibold tracking-[0.2em] uppercase text-[#6366f1] mb-4">
      {children}
    </span>
  )
}
