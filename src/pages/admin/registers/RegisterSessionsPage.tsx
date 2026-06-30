import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { registersApi, usersApi } from '../../../lib/api'

interface User {
  id: number
  fullName: string
}

interface RegisterSession {
  id: number
  openedAt: string
  closedAt?: string | null
  openingFloat: string | number
  closingActual?: string | number | null
  variance?: string | number | null
  varianceType?: string | null
  status: string
  register: { name: string }
  cashier: { fullName: string }
}

const VARIANCE_CLASS: Record<string, string> = {
  balanced: 'text-indigo-600',
  shortage: 'text-red-600',
  overage: 'text-amber-600',
}

export default function RegisterSessionsPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('')
  const [userFilter, setUserFilter] = useState<number | ''>('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const { data: sessions = [], isLoading } = useQuery<RegisterSession[]>({
    queryKey: ['register-sessions', statusFilter, userFilter, from, to],
    queryFn: () => registersApi.listSessions({
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(userFilter ? { userId: userFilter } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    }),
  })

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => usersApi.list(),
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Register Sessions</h1>
        <p className="text-sm text-slate-500">View all cash register sessions</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <select
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
          <select
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">All users</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.fullName}</option>)}
          </select>
          <input
            type="date"
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 w-40"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <input
            type="date"
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 w-40"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Register</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cashier</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Opened</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Closed</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Opening</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Closing</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Variance</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">No sessions found</td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => navigate(`/admin/registers/sessions/${s.id}`)}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{s.register.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{s.cashier.fullName}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(s.openedAt).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{s.closedAt ? new Date(s.closedAt).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3 text-right text-sm text-slate-700">
                      GH₵ {Number(s.openingFloat).toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-700">
                      {s.closingActual
                        ? `GH₵ ${Number(s.closingActual).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`
                        : '—'}
                    </td>
                    <td className={`px-4 py-3 text-right text-sm font-medium ${VARIANCE_CLASS[s.varianceType ?? ''] ?? ''}`}>
                      {s.variance != null
                        ? `${Number(s.variance) >= 0 ? '+' : ''}GH₵ ${Math.abs(Number(s.variance)).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${s.status === 'open' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {s.status === 'open' ? 'Open' : 'Closed'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
