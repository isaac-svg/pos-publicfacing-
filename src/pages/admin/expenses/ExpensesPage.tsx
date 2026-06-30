import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, CheckCircle, XCircle, Trash2, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { expensesApi, expenseCategoriesApi } from '../../../lib/api'

interface ExpenseCategory {
  id: number
  name: string
}

interface Expense {
  id: number
  description: string
  reference?: string | null
  recordedAt: string
  paymentMethod: string
  status: string
  amount: number
  category: ExpenseCategory
}

const statusBadge: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
}

export default function ExpensesPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [rejectDialog, setRejectDialog] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [toastMsg, setToastMsg] = useState('')

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ['expenses', statusFilter, categoryFilter],
    queryFn: () => expensesApi.list({
      status: statusFilter || undefined,
      categoryId: categoryFilter ? parseInt(categoryFilter) : undefined,
    }),
  })

  const { data: categories = [] } = useQuery<ExpenseCategory[]>({
    queryKey: ['expense-categories'],
    queryFn: () => expenseCategoriesApi.list(),
  })

  const approveMutation = useMutation({
    mutationFn: ({ id, action, reason }: { id: number; action: 'approved' | 'rejected'; reason?: string }) =>
      expensesApi.approve(id, action, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      showToast('Expense updated')
      setRejectDialog(null)
      setRejectReason('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => expensesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      showToast('Expense deleted')
    },
  })

  const filtered = expenses.filter(
    (e) =>
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      (e.reference ?? '').toLowerCase().includes(search.toLowerCase()),
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
          <h1 className="text-xl font-bold text-slate-900">Expenses</h1>
          <p className="text-sm text-slate-500">Track all business spending</p>
        </div>
        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50"
            onClick={() => navigate('/admin/expenses/recurring')}
          >
            Recurring
          </button>
          <button
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            onClick={() => navigate('/admin/expenses/new')}
          >
            <Plus className="w-4 h-4" />
            Record expense
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Method</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 w-28"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">No expenses found</td>
                </tr>
              ) : (
                filtered.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs text-slate-700 whitespace-nowrap">
                      {format(new Date(exp.recordedAt), 'dd MMM yyyy HH:mm')}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {exp.category.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 max-w-[200px] truncate">{exp.description}</td>
                    <td className="px-4 py-3 text-xs text-slate-700 capitalize">{exp.paymentMethod.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[exp.status] ?? 'bg-slate-50 text-slate-600'}`}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-mono font-semibold text-slate-900">
                      GH₵ {Number(exp.amount).toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {exp.status === 'pending' && (
                          <>
                            <button
                              className="p-1.5 rounded text-slate-400 hover:text-green-600 hover:bg-green-50"
                              onClick={() => approveMutation.mutate({ id: exp.id, action: 'approved' })}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() => { setRejectDialog(exp.id); setRejectReason('') }}
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {exp.status !== 'approved' && (
                          <button
                            className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => deleteMutation.mutate(exp.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Reject modal */}
      {rejectDialog !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Reject expense</h2>
            <div className="space-y-3">
              <label className="block text-sm text-slate-700">Reason for rejection</label>
              <textarea
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Optional reason..."
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                disabled={approveMutation.isPending}
                onClick={() => approveMutation.mutate({ id: rejectDialog, action: 'rejected', reason: rejectReason || undefined })}
              >
                {approveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm rejection
              </button>
              <button
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50"
                onClick={() => setRejectDialog(null)}
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
