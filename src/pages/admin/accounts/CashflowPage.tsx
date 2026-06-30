import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { accountsApi } from '../../../lib/api'

interface ByTypeEntry {
  in: number
  out: number
}

interface CashflowReport {
  totalInflow: number
  totalOutflow: number
  netFlow: number
  transactionCount: number
  byType: Record<string, ByTypeEntry>
}

function fmt(v: number) {
  return `GH₵ ${Number(v).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`
}

export default function CashflowPage() {
  const { data: report, isLoading } = useQuery<CashflowReport>({
    queryKey: ['cashflow-report'],
    queryFn: () => accountsApi.getCashflowReport(),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (!report) return null

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Cashflow Report</h1>
        <p className="text-sm text-muted-foreground">Money in vs money out</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Total inflow</p>
          <p className="text-2xl font-bold font-mono text-foreground mt-1">{fmt(report.totalInflow)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Total outflow</p>
          <p className="text-2xl font-bold font-mono text-foreground mt-1">{fmt(report.totalOutflow)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Net flow</p>
          <p className={`text-2xl font-bold font-mono mt-1 ${report.netFlow >= 0 ? 'text-foreground' : 'text-destructive'}`}>
            {fmt(report.netFlow)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{report.transactionCount} transaction(s)</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 pt-4 pb-2 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Breakdown by type</p>
        </div>
        <table className="w-full">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Inflow</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Outflow</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Net</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Object.entries(report.byType).map(([type, data]) => (
              <tr key={type} className="hover:bg-muted/40">
                <td className="px-4 py-3 text-sm font-medium text-foreground capitalize">{type.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3 text-right font-mono text-sm text-foreground">{fmt(data.in)}</td>
                <td className="px-4 py-3 text-right font-mono text-sm text-foreground">{fmt(data.out)}</td>
                <td className={`px-4 py-3 text-right font-mono font-semibold text-sm ${data.in - data.out >= 0 ? 'text-foreground' : 'text-destructive'}`}>
                  {fmt(data.in - data.out)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
