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
          <h1 className="text-xl font-bold text-slate-900">Suppliers</h1>
          <p className="text-sm text-slate-500">Manage suppliers you buy stock from</p>
        </div>
        <button
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          onClick={() => navigate('/admin/suppliers/new')}
        >
          <Plus className="w-4 h-4" />
          Add supplier
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <input
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 w-64"
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
          <span className="text-sm text-slate-600">Show deleted</span>
        </label>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Balance</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-400">
                    {search ? 'Try a different search term.' : 'Add your first supplier.'}
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => navigate(`/admin/suppliers/${s.id}`)}
                  >
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <span className={`font-medium ${s.isDeleted ? 'text-slate-400 line-through' : ''}`}>{s.name}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{s.companyName ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{s.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`font-mono font-semibold ${s.currentBalance > 0 ? 'text-red-600' : 'text-slate-700'}`}>
                        {s.currentBalance > 0 ? '+' : ''}GH₵ {Number(s.currentBalance).toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {!s.isDeleted && (
                        <div className="flex gap-1">
                          <button
                            className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/suppliers/${s.id}`) }}
                            title="View profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/suppliers/${s.id}/edit`) }}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="p-1.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50"
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
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-base font-semibold text-slate-900 mb-2">Delete "{deleteTarget.name}"?</h2>
            <p className="text-sm text-slate-500 mb-5">This supplier will be hidden. Existing purchase records are preserved.</p>
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
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50"
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
