import { Construction } from 'lucide-react'

export function ComingSoon({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-3">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
        <Construction className="w-5 h-5 text-slate-400" />
      </div>
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      <p className="text-sm text-slate-500 max-w-sm">
        {description ?? 'This section is being ported to the web. Use the desktop app in the meantime.'}
      </p>
    </div>
  )
}
