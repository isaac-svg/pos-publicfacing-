import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { Banknote, ShoppingCart, Wallet, Loader2 } from 'lucide-react'
import { performanceApi } from '../../lib/api'

type ChartPeriod = 'week' | 'month' | '3months' | '6months' | 'year'

const PERIODS: { value: ChartPeriod; label: string }[] = [
  { value: 'week',    label: 'This week' },
  { value: 'month',   label: 'This month' },
  { value: '3months', label: '3 months' },
  { value: '6months', label: '6 months' },
  { value: 'year',    label: 'This year' },
]

const PALETTE = ['#2E67FF', '#F97316', '#10B981', '#8B5CF6', '#F59E0B']

function fmt(n: number | string) {
  return `GH₵ ${Number(n).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function StatCard({ icon: Icon, label, value, sub }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold text-foreground">{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className="rounded-md bg-accent p-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
    </div>
  )
}

function RevenueTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { value: number; dataKey: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 shadow-md text-xs">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-muted-foreground">
          {p.dataKey === 'revenue' ? `Revenue: ${fmt(p.value)}` : `Sales: ${p.value}`}
        </p>
      ))}
    </div>
  )
}

function BarTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 shadow-md text-xs">
      <p className="font-medium text-foreground mb-1">{label}</p>
      <p className="text-muted-foreground">{fmt(payload[0].value)}</p>
    </div>
  )
}

export default function PerformancePage() {
  const [period, setPeriod] = useState<ChartPeriod>('month')

  const { data, isLoading } = useQuery({
    queryKey: ['sales-chart', period],
    queryFn: () => performanceApi.chart(period),
    staleTime: 60_000,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Performance</h1>
          <p className="text-sm text-muted-foreground">Sales trends and business insights</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                period === p.value
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              icon={Banknote}
              label="Total revenue"
              value={fmt(data.summary.totalRevenue)}
            />
            <StatCard
              icon={ShoppingCart}
              label="Total transactions"
              value={data.summary.totalTransactions.toLocaleString()}
            />
            <StatCard
              icon={Wallet}
              label="Avg per transaction"
              value={fmt(data.summary.avgPerTransaction)}
            />
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-5 pt-4 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Revenue trend</p>
            </div>
            <div className="px-5 pb-5">
              {data.series.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No sales in this period.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={data.series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#2E67FF" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#2E67FF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                      width={48}
                    />
                    <Tooltip content={<RevenueTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2E67FF"
                      strokeWidth={2}
                      fill="url(#gradRevenue)"
                      dot={false}
                      activeDot={{ r: 4, fill: '#2E67FF' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-5 pt-4 pb-2">
                <p className="text-sm font-medium text-muted-foreground">Top products by revenue</p>
              </div>
              <div className="px-5 pb-5">
                {data.topProducts.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">No product sales in this period.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      layout="vertical"
                      data={data.topProducts}
                      margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={90}
                        tick={{ fontSize: 11, fill: '#374151' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: string) => v.length > 12 ? `${v.slice(0, 12)}…` : v}
                      />
                      <Tooltip content={<BarTooltip />} cursor={{ fill: '#f1f5f9' }} />
                      <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                        {data.topProducts.map((_: unknown, i: number) => (
                          <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-5 pt-4 pb-2">
                <p className="text-sm font-medium text-muted-foreground">Revenue by shop</p>
              </div>
              <div className="px-5 pb-5">
                {data.byShop.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">No sales in this period.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      layout="vertical"
                      data={data.byShop}
                      margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={90}
                        tick={{ fontSize: 11, fill: '#374151' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: string) => v.length > 12 ? `${v.slice(0, 12)}…` : v}
                      />
                      <Tooltip content={<BarTooltip />} cursor={{ fill: '#f1f5f9' }} />
                      <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                        {data.byShop.map((_: unknown, i: number) => (
                          <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
