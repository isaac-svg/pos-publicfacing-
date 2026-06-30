import { useQuery } from '@tanstack/react-query'
import { creditApi } from '../../../lib/api'

export default function CreditDashboardPage() {
  const { data: summary } = useQuery({ queryKey: ['credit-summary'], queryFn: () => creditApi.dashboard.summary() })

  const s = summary as { totalOutstanding?: number; collectedToday?: number; collectedThisMonth?: number; activeAccounts?: number; overdueAccounts?: number; highRiskCustomers?: number } | undefined

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Credit Dashboard</h1>
      {s && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {([['Outstanding', s.totalOutstanding], ['Collected Today', s.collectedToday], ['This Month', s.collectedThisMonth], ['Active Accounts', s.activeAccounts], ['Overdue', s.overdueAccounts], ['High Risk', s.highRiskCustomers]] as [string, number | undefined][]).map(([l, v]) => (
            <div key={l} className="bg-card rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">{l}</p>
              <p className="text-xl font-bold mt-1">{typeof v === 'number' && l !== 'Active Accounts' && l !== 'Overdue' && l !== 'High Risk' ? `GH₵${v.toFixed(2)}` : v ?? '—'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
