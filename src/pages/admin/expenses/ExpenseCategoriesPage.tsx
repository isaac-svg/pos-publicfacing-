import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react'
import { expenseCategoriesApi } from '../../../lib/api'

interface ExpenseCategory {
  id: number
  name: string
  description?: string | null
  isActive: boolean
}

export default function ExpenseCategoriesPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [toastMsg, setToastMsg] = useState('')

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  const { data: categories = [], isLoading } = useQuery<ExpenseCategory[]>({
    queryKey: ['expense-categories'],
    queryFn: () => expenseCategoriesApi.list({ include_inactive: true }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => expenseCategoriesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expense-categories'] })
      showToast('Category deleted')
    },
  })

  const filtered = categories.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()),
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
          <h1 className="text-xl font-bold text-foreground">Expense categories</h1>
          <p className="text-sm text-muted-foreground">Manage expense classification</p>
        </div>
        <button
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          onClick={() => navigate('/admin/expenses/categories/new')}
        >
          <Plus className="w-4 h-4" />
          Add category
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="w-full h-9 rounded-lg border border-border bg-card pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-sm text-muted-foreground">No categories found</td>
                </tr>
              ) : (
                filtered.map((cat) => (
                  <tr key={cat.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{cat.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{cat.description ?? '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cat.isActive ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          className="p-1.5 rounded text-muted-foreground hover:text-muted-foreground hover:bg-muted"
                          title="Edit category" onClick={() => navigate(`/admin/expenses/categories/${cat.id}/edit`)}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Delete category" onClick={() => deleteMutation.mutate(cat.id)}
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
    </div>
  )
}
