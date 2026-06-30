import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { salesApi, reportsApi, allocationsApi } from '../../lib/api'

export default function AdminDashboardPage() {
  const { data: sales = [] } = useQuery({ queryKey: ['recent-sales'], queryFn: () => salesApi.list({ from: new Date().toISOString().slice(0, 10) }) })
  const { data: report } = useQuery({ queryKey: ['sales-report-month'], queryFn: () => {
    const now = new Date()
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
    const to = now.toISOString().slice(0, 10)
    return reportsApi.sales({ from, to })
  }})
  const { data: allocs = [] } = useQuery({ queryKey: ['allocations-lowstock'], queryFn: () => allocationsApi.list({ low_stock: true }) })

  const todaySales = (sales as { totalAmount: string }[])
  const todayTotal = todaySales.reduce((s: number, sale: { totalAmount: string }) => s + Number(sale.totalAmount), 0)
  const monthTotal = (report as { summary?: { totalRevenue: number } })?.summary?.totalRevenue ?? 0
  const lowStockCount = (allocs as unknown[]).length

  const topProducts = ((report as { byProduct?: { name: string; revenue: number }[] })?.byProduct ?? []).slice(0, 5)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Today's Sales</p>
          <p className="text-2xl font-bold mt-1">GH₵{todayTotal.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">{todaySales.length} transaction(s)</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">This Month</p>
          <p className="text-2xl font-bold mt-1">GH₵{monthTotal.toFixed(2)}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Low Stock Alerts</p>
          <p className="text-2xl font-bold mt-1">{lowStockCount}</p>
          <p className="text-xs text-muted-foreground">items below threshold</p>
        </div>
      </div>

      {topProducts.length > 0 && (
        <div className="bg-card rounded-lg border p-4">
          <h2 className="text-sm font-semibold mb-3">Top Products</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topProducts}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-card rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="text-sm font-semibold">Recent Sales</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-medium">ID</th>
                <th className="px-4 py-2 text-right font-medium">Amount</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
                <th className="px-4 py-2 text-left font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {todaySales.slice(0, 10).map((s: { id?: number; totalAmount: string; status?: string; createdAt?: string }, i: number) => (
                <tr key={i} className="hover:bg-background">
                  <td className="px-4 py-2">#{s.id ?? i + 1}</td>
                  <td className="px-4 py-2 text-right font-medium">GH₵{Number(s.totalAmount).toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <span className="inline-block px-2 py-0.5 rounded text-xs bg-green-100 text-accent-foreground">{s.status ?? 'completed'}</span>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground text-xs">{s.createdAt ? new Date(s.createdAt).toLocaleTimeString() : '—'}</td>
                </tr>
              ))}
              {todaySales.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No sales today</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
