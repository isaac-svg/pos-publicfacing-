import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, ArrowLeft, Loader2, Play } from 'lucide-react'
import { expensesApi, expenseCategoriesApi } from '../../../lib/api'

interface ExpenseCategory {
  id: number
  name: string
}

interface RecurringExpense {
  id: number
  categoryId: number
  amount: number
  description: string
  frequency: string
  dayOfMonth?: number | null
  dayOfWeek?: number | null
  paymentMethod: string
  isActive: boolean
  category: ExpenseCategory
}

const FREQUENCIES = ['monthly', 'weekly', 'yearly'] as const
const PAYMENT_METHODS = ['cash', 'mobile_money', 'bank_transfer', 'cheque'] as const

interface FormState {
  categoryId: string
  amount: string
  description: string
  frequency: string
  dayOfMonth: string
  dayOfWeek: string
  paymentMethod: string
}

const emptyForm = (): FormState => ({
  categoryId: '',
  amount: '',
  description: '',
  frequency: 'monthly',
  dayOfMonth: '1',
  dayOfWeek: '0',
  paymentMethod: 'cash',
})

export default function RecurringExpensesPage() {
  const qc = useQueryClient()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  const { data: recurring = [], isLoading } = useQuery<RecurringExpense[]>({
    queryKey: ['recurring-expenses'],
    queryFn: () => expensesApi.listRecurring(),
  })

  const { data: categories = [] } = useQuery<ExpenseCategory[]>({
    queryKey: ['expense-categories'],
    queryFn: () => expenseCategoriesApi.list(),
  })

  const createMutation = useMutation({
    mutationFn: () => expensesApi.createRecurring({
      categoryId: parseInt(form.categoryId),
      amount: parseFloat(form.amount),
      description: form.description,
      frequency: form.frequency,
      dayOfMonth: form.frequency === 'monthly' || form.frequency === 'yearly' ? parseInt(form.dayOfMonth) : undefined,
      dayOfWeek: form.frequency === 'weekly' ? parseInt(form.dayOfWeek) : undefined,
      paymentMethod: form.paymentMethod,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurring-expenses'] })
      showToast('Recurring expense created')
      setDialogOpen(false)
      setEditingId(null)
      setForm(emptyForm())
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => expensesApi.updateRecurring(editingId!, {
      categoryId: parseInt(form.categoryId),
      amount: parseFloat(form.amount),
      description: form.description,
      frequency: form.frequency,
      dayOfMonth: form.frequency === 'monthly' || form.frequency === 'yearly' ? parseInt(form.dayOfMonth) : undefined,
      dayOfWeek: form.frequency === 'weekly' ? parseInt(form.dayOfWeek) : undefined,
      paymentMethod: form.paymentMethod,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurring-expenses'] })
      showToast('Recurring expense updated')
      setDialogOpen(false)
      setEditingId(null)
      setForm(emptyForm())
    },
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      expensesApi.updateRecurring(id, { isActive }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurring-expenses'] })
      showToast('Status updated')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => expensesApi.deleteRecurring(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurring-expenses'] })
      showToast('Deleted')
    },
  })

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm())
    setDialogOpen(true)
  }

  const openEdit = (re: RecurringExpense) => {
    setEditingId(re.id)
    setForm({
      categoryId: String(re.categoryId),
      amount: String(re.amount),
      description: re.description,
      frequency: re.frequency,
      dayOfMonth: String(re.dayOfMonth ?? 1),
      dayOfWeek: String(re.dayOfWeek ?? 0),
      paymentMethod: re.paymentMethod,
    })
    setDialogOpen(true)
  }

  return (
    <div className="space-y-5">
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 rounded-lg bg-slate-900 text-white px-4 py-2 text-sm shadow-lg">
          {toastMsg}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Recurring expenses</h1>
          <p className="text-sm text-slate-500">Auto-generated monthly bills (rent, salaries, etc.)</p>
        </div>
        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            onClick={openCreate}
          >
            <Plus className="w-4 h-4" />
            Add recurring
          </button>
        </div>
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Frequency</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Day</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Method</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recurring.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">No recurring expenses configured</td>
                </tr>
              ) : (
                recurring.map((re) => (
                  <tr key={re.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{re.category.name}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 max-w-[200px] truncate">{re.description}</td>
                    <td className="px-4 py-3 text-xs text-slate-700 capitalize">{re.frequency}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">
                      {re.dayOfMonth != null ? `Day ${re.dayOfMonth}` : re.dayOfWeek != null ? `Day ${re.dayOfWeek}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700 capitalize">{re.paymentMethod.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${re.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {re.isActive ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-mono font-semibold text-slate-900">
                      GH₵ {Number(re.amount).toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100" onClick={() => openEdit(re)}>
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                          onClick={() => toggleMutation.mutate({ id: re.id, isActive: !re.isActive })}
                        >
                          <Play className={`w-4 h-4 ${re.isActive ? 'text-slate-400' : 'text-indigo-600'}`} />
                        </button>
                        <button className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => deleteMutation.mutate(re.id)}>
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

      {/* Form modal */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-base font-semibold text-slate-900 mb-4">
              {editingId ? 'Edit recurring expense' : 'Add recurring expense'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-700 mb-1">Category *</label>
                <select
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                >
                  <option value="">Select</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">Amount (GH₵) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">Description *</label>
                <input
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-700 mb-1">Frequency</label>
                  <select
                    className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                    value={form.frequency}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  >
                    {FREQUENCIES.map((f) => (
                      <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-1">
                    {form.frequency === 'weekly' ? 'Day of week' : 'Day of month'}
                  </label>
                  {form.frequency === 'weekly' ? (
                    <select
                      className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                      value={form.dayOfWeek}
                      onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
                    >
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                        <option key={i} value={String(i)}>{d}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      min="1"
                      max="31"
                      className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                      value={form.dayOfMonth}
                      onChange={(e) => setForm({ ...form, dayOfMonth: e.target.value })}
                    />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">Payment method</label>
                <select
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  value={form.paymentMethod}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex-1 justify-center"
                  onClick={() => editingId ? updateMutation.mutate() : createMutation.mutate()}
                  disabled={!form.categoryId || !form.amount || !form.description || createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Save changes' : 'Create recurring expense'}
                </button>
                <button
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
