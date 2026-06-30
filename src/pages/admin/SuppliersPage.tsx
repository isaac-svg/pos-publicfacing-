import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Eye, Loader2 } from 'lucide-react'
import { suppliersApi } from '../../lib/api'

interface Supplier {
  id: number
  name: string
  companyName?: string | null
  phone?: string | null
  currentBalance: number
  isDeleted: boolean
}

export default function SuppliersPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showDeleted, setShowDeleted] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null)
  const [error, setError] = useState('')

  const { data: suppliers = [], isLoading } = useQuery<Supplier[]>({
    queryKey: ['suppliers', showDeleted],
    queryFn: () => suppliersApi.list({ include_deleted: showDeleted }),
  })

  const filtered = useMemo(
    () =>
      suppliers.filter((s) => {
        if (showDeleted ? !s.isDeleted : s.isDeleted) return false
        if (!search) return true
        const q = search.toLowerCase()
        return (
          s.name.toLowerCase().includes(q) ||
          (s.companyName ?? '').toLowerCase().includes(q) ||
          (s.phone ?? '').includes(q)
        )
      }),
    [suppliers, search, showDeleted],
  )

  const deleteMutation = useMutation({
    mutationFn: (id: number) => suppliersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] })
      setDeleteTarget(null)
    },
    onError: () => {
      setError('Cannot delete supplier')
      setDeleteTarget(null)
    },
  })

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Suppliers</h1>
          <p className="text-sm text-muted-foreground">Manage suppliers you buy stock from</p>
        </div>
        <button
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          onClick={() => navigate('/admin/suppliers/new')}
        >
          <Plus className="w-4 h-4" />
          Add supplier
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">{error}</div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <input
          className="h-9 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring w-64"
          placeholder="Search by name, company or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => setShowDeleted(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-muted-foreground">Show deleted</span>
        </label>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Balance</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    {search ? 'Try a different search term.' : 'Add your first supplier.'}
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-muted/40 cursor-pointer"
                    onClick={() => navigate(`/admin/suppliers/${s.id}`)}
                  >
                    <td className="px-4 py-3 text-sm text-foreground">
                      <span className={`font-medium ${s.isDeleted ? 'text-muted-foreground line-through' : ''}`}>{s.name}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{s.companyName ?? '-'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{s.phone ?? '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`font-mono font-semibold ${s.currentBalance > 0 ? 'text-destructive' : 'text-foreground'}`}>
                        {s.currentBalance > 0 ? '+' : ''}GH₵ {Number(s.currentBalance).toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {!s.isDeleted && (
                        <div className="flex gap-1">
                          <button
                            className="p-1.5 rounded text-muted-foreground hover:text-muted-foreground hover:bg-muted"
                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/suppliers/${s.id}`) }}
                            title="View profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="p-1.5 rounded text-muted-foreground hover:text-muted-foreground hover:bg-muted"
                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/suppliers/${s.id}/edit`) }}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button title="Delete supplier"
                            className="p-1.5 rounded text-red-400 hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(s) }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-base font-semibold text-foreground mb-2">Delete "{deleteTarget.name}"?</h2>
            <p className="text-sm text-muted-foreground mb-5">This supplier will be hidden. Existing purchase records are preserved.</p>
            <div className="flex gap-3">
              <button
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
              >
                {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
              <button
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-muted/40"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
