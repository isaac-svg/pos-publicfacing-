import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { registersApi, shopsApi, usersApi } from '../../../lib/api'

type Tab = 'register' | 'cashier' | 'eod'

interface Shop {
  id: number
  name: string
}

interface User {
  id: number
  fullName: string
}

interface Register {
  id: number
  name: string
  shop?: { name: string } | null
}

function fmt(v: number) {
  return `GH₵ ${Number(v).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`
}

export default function RegisterReportsPage() {
  const [tab, setTab] = useState<Tab>('eod')
  const [registerId, setRegisterId] = useState('')
  const [userId, setUserId] = useState('')
  const [shopId, setShopId] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [eodDate, setEodDate] = useState(new Date().toISOString().slice(0, 10))

  const { data: registers = [] } = useQuery<Register[]>({
    queryKey: ['cash-registers'],
    queryFn: () => registersApi.listRegisters(),
  })

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => usersApi.list(),
  })

  const { data: shops = [] } = useQuery<Shop[]>({
    queryKey: ['shops'],
    queryFn: () => shopsApi.list(),
  })

  const { data: eodReport } = useQuery({
    queryKey: ['register-eod', eodDate, shopId],
    queryFn: () => registersApi.getEndOfDayReport({
      date: eodDate,
      ...(shopId && shopId !== 'all' ? { shopId: Number(shopId) } : {}),
    }),
    enabled: tab === 'eod' && !!eodDate,
  })

  const { data: registerReport } = useQuery({
    queryKey: ['register-history', registerId, from, to],
    queryFn: () => registersApi.getRegisterHistory(Number(registerId), {
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    }),
    enabled: tab === 'register' && !!registerId,
  })

  const { data: cashierReport } = useQuery({
    queryKey: ['cashier-report', userId, from, to],
    queryFn: () => registersApi.getCashierReport(Number(userId), {
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    }),
    enabled: tab === 'cashier' && !!userId,
  })

  const inputCls = 'h-9 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring'
  const selectCls = inputCls

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Register Reports</h1>
        <p className="text-sm text-muted-foreground">Cash register analytics and reconciliation</p>
      </div>

      <div className="flex gap-2">
        {([
          ['eod', 'End of Day'],
          ['register', 'Register History'],
          ['cashier', 'Cashier Report'],
        ] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'border border-border bg-card text-foreground hover:bg-muted/40'
            }`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* End of Day */}
      {tab === 'eod' && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-5 pt-4 pb-2 border-b border-border">
            <p className="text-sm font-semibold text-foreground">End of Day Report</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-end gap-3">
              <div>
                <label className="block text-sm text-foreground mb-1">Date</label>
                <input type="date" className={`${inputCls} w-44`} value={eodDate} onChange={(e) => setEodDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-foreground mb-1">Shop</label>
                <select className={`${selectCls} w-48`} value={shopId} onChange={(e) => setShopId(e.target.value)}>
                  <option value="all">All shops</option>
                  {shops.map((s) => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
                </select>
              </div>
            </div>

            {eodReport && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {([
                    ['Sessions', eodReport.totals.sessionCount, false],
                    ['Sales', eodReport.totals.totalSales, true],
                    ['Refunds', eodReport.totals.totalRefunds, true],
                    ['Expenses', eodReport.totals.totalExpenses, true],
                    ['Variance', eodReport.totals.totalVariance, true],
                  ] as [string, number, boolean][]).map(([l, v, isCurrency]) => (
                    <div key={l} className="rounded-lg border border-border bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">{l}</p>
                      <p className={`mt-1 font-semibold text-foreground ${l === 'Variance' && v < 0 ? 'text-destructive' : ''}`}>
                        {isCurrency ? fmt(v) : v}
                      </p>
                    </div>
                  ))}
                </div>
                {eodReport.registers?.map((r: {
                  registerId: number
                  registerName: string
                  sessions: {
                    id: number
                    cashier: { fullName: string }
                    openingFloat: string
                    closingActual: string | null
                    variance: string | null
                    varianceType: string | null
                  }[]
                }) => (
                  <div key={r.registerId} className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{r.registerName}</p>
                    <div className="rounded-lg border border-border text-xs divide-y divide-border">
                      {r.sessions.map((s) => (
                        <div key={s.id} className="flex justify-between px-3 py-2">
                          <span className="text-foreground">{s.cashier.fullName}</span>
                          <span className="text-muted-foreground">Float: {fmt(Number(s.openingFloat))}</span>
                          <span className="text-muted-foreground">Actual: {s.closingActual ? fmt(Number(s.closingActual)) : '—'}</span>
                          <span className={
                            s.varianceType === 'shortage' ? 'text-destructive' :
                            s.varianceType === 'overage' ? 'text-foreground' : 'text-primary'
                          }>
                            {s.variance != null ? `${Number(s.variance) >= 0 ? '+' : ''}${Number(s.variance).toFixed(2)}` : '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Register History */}
      {tab === 'register' && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-5 pt-4 pb-2 border-b border-border">
            <p className="text-sm font-semibold text-foreground">Register History</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-end gap-3">
              <div>
                <label className="block text-sm text-foreground mb-1">Register</label>
                <select className={`${selectCls} w-52`} value={registerId} onChange={(e) => setRegisterId(e.target.value)}>
                  <option value="">Select register…</option>
                  {registers.map((r) => (
                    <option key={r.id} value={String(r.id)}>{r.name} ({r.shop?.name})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-foreground mb-1">From</label>
                <input type="date" className={`${inputCls} w-40`} value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-foreground mb-1">To</label>
                <input type="date" className={`${inputCls} w-40`} value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </div>
            {registerReport && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {([
                  ['Sessions', registerReport.totals.sessionCount, false],
                  ['Sales', registerReport.totals.totalSales, true],
                  ['Refunds', registerReport.totals.totalRefunds, true],
                  ['Expenses', registerReport.totals.totalExpenses, true],
                  ['Variance', registerReport.totals.totalVariance, true],
                ] as [string, number, boolean][]).map(([l, v, isCurrency]) => (
                  <div key={l} className="rounded-lg border border-border bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">{l}</p>
                    <p className="mt-1 font-semibold text-foreground">{isCurrency ? fmt(v) : v}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cashier Report */}
      {tab === 'cashier' && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-5 pt-4 pb-2 border-b border-border">
            <p className="text-sm font-semibold text-foreground">Cashier Report</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-end gap-3">
              <div>
                <label className="block text-sm text-foreground mb-1">Cashier</label>
                <select className={`${selectCls} w-52`} value={userId} onChange={(e) => setUserId(e.target.value)}>
                  <option value="">Select user…</option>
                  {users.map((u) => (
                    <option key={u.id} value={String(u.id)}>{u.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-foreground mb-1">From</label>
                <input type="date" className={`${inputCls} w-40`} value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-foreground mb-1">To</label>
                <input type="date" className={`${inputCls} w-40`} value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </div>
            {cashierReport && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {([
                  ['Sessions', cashierReport.totals.sessionCount, false],
                  ['Sales', cashierReport.totals.totalSales, true],
                  ['Total Variance', cashierReport.totals.totalVariance, true],
                  ['Shortages', cashierReport.totals.shortageCount, false],
                ] as [string, number, boolean][]).map(([l, v, isCurrency]) => (
                  <div key={l} className="rounded-lg border border-border bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">{l}</p>
                    <p className="mt-1 font-semibold text-foreground">{isCurrency ? fmt(v) : v}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
