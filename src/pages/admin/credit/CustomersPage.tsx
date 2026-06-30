import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { creditApi } from '../../../lib/api'

export default function CreditCustomersPage() {
  const [q, setQ] = useState('')
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['credit-customers', q],
    queryFn: () => creditApi.customers.list(q ? { q } : {}),
  })

  const list = customers as { id: number; fullName: string; phone: string; totalOutstanding: string; riskScore: string; isBlacklisted: boolean }[]

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Credit Customers</h1>
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…" className="w-full h-9 rounded-md border pl-9 px-3 text-sm" />
      </div>
      <div className="bg-card rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-background text-xs text-muted-foreground">
            <tr><th className="px-4 py-2 text-left font-medium">Customer</th><th className="px-4 py-2 text-left font-medium">Phone</th><th className="px-4 py-2 text-right font-medium">Outstanding</th><th className="px-4 py-2 text-center font-medium">Risk</th></tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr> :
              list.length === 0 ? <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No customers</td></tr> :
              list.map(c => (
                <tr key={c.id} className="hover:bg-background cursor-pointer" onClick={() => window.location.href = `/credit/customers/${c.id}`}>
                  <td className="px-4 py-2 font-medium">{c.fullName}</td>
                  <td className="px-4 py-2 text-muted-foreground">{c.phone}</td>
                  <td className="px-4 py-2 text-right">GH₵{Number(c.totalOutstanding).toFixed(2)}</td>
                  <td className="px-4 py-2 text-center"><span className={`px-2 py-0.5 rounded text-xs ${c.riskScore === 'high' ? 'bg-red-100 text-destructive' : c.riskScore === 'medium' ? 'bg-amber-100 text-foreground' : 'bg-green-100 text-accent-foreground'}`}>{c.riskScore}</span></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
