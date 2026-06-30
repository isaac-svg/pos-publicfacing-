import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Search, Play, Loader2 } from 'lucide-react'
import { registersApi, shopsApi, usersApi } from '../../../lib/api'

interface Shop {
  id: number
  name: string
}

interface User {
  id: number
  fullName: string
  isActive: boolean
}

interface Register {
  id: number
  name: string
  code?: string | null
  isActive: boolean
  shop?: { name: string } | null
}

export default function RegistersPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [shopFilter, setShopFilter] = useState('')
  const [openSessionFor, setOpenSessionFor] = useState<number | null>(null)
  const [assignedCashier, setAssignedCashier] = useState('')
  const [openingFloat, setOpeningFloat] = useState('')
  const [openingNote, setOpeningNote] = useState('')
  const [toastMsg, setToastMsg] = useState('')

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  const { data: registers = [], isLoading } = useQuery<Register[]>({
    queryKey: ['cash-registers', shopFilter],
    queryFn: () => registersApi.listRegisters(shopFilter ? { shopId: Number(shopFilter) } : undefined),
  })

  const { data: shops = [] } = useQuery<Shop[]>({
    queryKey: ['shops'],
    queryFn: () => shopsApi.list(),
  })

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => usersApi.list(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => registersApi.deleteRegister(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cash-registers'] })
      showToast('Register deleted')
    },
  })

  const openSessionMutation = useMutation({
    mutationFn: () => registersApi.openSession({
      registerId: openSessionFor!,
      assignedTo: Number(assignedCashier),
      openingFloat: parseFloat(openingFloat),
      openingNote: openingNote || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cash-registers'] })
      qc.invalidateQueries({ queryKey: ['register-sessions'] })
      showToast('Register session opened')
      setOpenSessionFor(null)
      setAssignedCashier('')
      setOpeningFloat('')
      setOpeningNote('')
    },
  })

  const filtered = registers.filter(
    (r) => r.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-5">
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 rounded-lg bg-slate-900 text-white px-4 py-2 text-sm shadow-lg">
          {toastMsg}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Cash Registers</h1>
          <p className="text-sm text-muted-foreground">Manage registers and open sessions for cashiers</p>
        </div>
        <button
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          onClick={() => navigate('/admin/registers/new')}
        >
          <Plus className="w-4 h-4" />
          Add register
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="w-full h-9 rounded-lg border border-border bg-card pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
              placeholder="Search registers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="h-9 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring w-44"
            value={shopFilter}
            onChange={(e) => setShopFilter(e.target.value === 'all' ? '' : e.target.value)}
          >
            <option value="">All shops</option>
            {shops.map((s) => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Code</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shop</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 w-32"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">No registers found</td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{r.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.code ?? '-'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{r.shop?.name ?? '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${r.isActive ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {r.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {r.isActive && (
                          <button
                            className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-accent"
                            title="Open session"
                            onClick={() => { setOpenSessionFor(r.id); setAssignedCashier(''); setOpeningFloat(''); setOpeningNote('') }}
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          className="p-1.5 rounded text-muted-foreground hover:text-muted-foreground hover:bg-muted"
                          title="Edit register" onClick={() => navigate(`/admin/registers/${r.id}/edit`)}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button title="Delete register"
                          className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Delete register" onClick={() => deleteMutation.mutate(r.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Open Session panel */}
      {openSessionFor && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <p className="text-sm font-semibold text-foreground">
            Open Register Session - {registers.find((r) => r.id === openSessionFor)?.name}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-foreground mb-1">Assign cashier *</label>
              <select
                className="w-full h-9 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
                value={assignedCashier}
                onChange={(e) => setAssignedCashier(e.target.value)}
              >
                <option value="">Select cashier…</option>
                {users.filter((u) => u.isActive).map((u) => (
                  <option key={u.id} value={String(u.id)}>{u.fullName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-foreground mb-1">Opening float (GH₵) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full h-9 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
                value={openingFloat}
                onChange={(e) => setOpeningFloat(e.target.value)}
                placeholder="200.00"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-foreground mb-1">Note (optional)</label>
            <input
              className="w-full h-9 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
              value={openingNote}
              onChange={(e) => setOpeningNote(e.target.value)}
              placeholder="e.g. Morning shift"
            />
          </div>
          <div className="flex gap-2">
            <button
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              disabled={!assignedCashier || !openingFloat || openSessionMutation.isPending}
              onClick={() => openSessionMutation.mutate()}
            >
              {openSessionMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Open Session
            </button>
            <button
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-muted/40"
              onClick={() => setOpenSessionFor(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
