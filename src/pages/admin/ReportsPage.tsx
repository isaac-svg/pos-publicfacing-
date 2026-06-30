import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { reportsApi } from '../../lib/api'

export default function ReportsPage() {
  const today = new Date().toISOString().slice(0, 10)
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
  const [from, setFrom] = useState(monthStart)
  const [to, setTo] = useState(today)

  const { data: report, isLoading } = useQuery({
    queryKey: ['sales-report', from, to],
    queryFn: () => reportsApi.sales({ from, to }),
    enabled: !!from && !!to,
  })

  const r = report as { summary?: { totalRevenue: number; totalCost: number; totalProfit: number; totalTransactions: number; totalItemsSold: number }; byProduct?: { name: string; revenue: number; quantity: number; profit: number }[]; chartData?: { date: string; revenue: number }[] } | undefined

  function exportCsv() {
    if (!r?.byProduct) return
    const csv = 'Product,Revenue,Qty Sold,Profit\n' + r.byProduct.map(p => `"${p.name}",${p.revenue},${p.quantity},${p.profit}`).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `sales-report-${from}-${to}.csv`
    a.click()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Sales Reports</h1>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="h-9 rounded-md border px-3 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="h-9 rounded-md border px-3 text-sm" />
        </div>
        {r?.byProduct && (
          <button onClick={exportCsv} className="h-9 px-4 rounded-md border text-sm font-medium hover:bg-background">Export CSV</button>
        )}
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p> : r?.summary && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([['Revenue', r.summary.totalRevenue], ['Cost', r.summary.totalCost], ['Profit', r.summary.totalProfit], ['Transactions', r.summary.totalTransactions]] as [string, number][]).map(([l, v]) => (
              <div key={l} className="bg-card rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">{l}</p>
                <p className="text-lg font-bold mt-1">{l === 'Transactions' ? v : `GH₵${v.toFixed(2)}`}</p>
              </div>
            ))}
          </div>

          {r.chartData && r.chartData.length > 0 && (
            <div className="bg-card rounded-lg border p-4">
              <h2 className="text-sm font-semibold mb-3">Revenue Over Time</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={r.chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {r.byProduct && r.byProduct.length > 0 && (
            <div className="bg-card rounded-lg border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-background text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Product</th>
                    <th className="px-4 py-2 text-right font-medium">Revenue</th>
                    <th className="px-4 py-2 text-right font-medium">Qty</th>
                    <th className="px-4 py-2 text-right font-medium">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {r.byProduct.map((p, i) => (
                    <tr key={i} className="hover:bg-background">
                      <td className="px-4 py-2 font-medium">{p.name}</td>
                      <td className="px-4 py-2 text-right">GH₵{p.revenue.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right">{p.quantity}</td>
                      <td className="px-4 py-2 text-right">{p.profit >= 0 ? '' : '-'}GH₵{Math.abs(p.profit).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
