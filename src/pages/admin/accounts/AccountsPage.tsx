import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Eye, ArrowUpDown, Loader2 } from 'lucide-react'
import { accountsApi } from '../../../lib/api'

interface Account {
  id: number
  name: string
  type: string
  currency: string
  isActive: boolean
}

const typeColors: Record<string, string> = {
  cash: 'bg-green-100 text-accent-foreground',
  mobile_money: 'bg-blue-100 text-blue-700',
  bank: 'bg-purple-100 text-purple-700',
  system_wallet: 'bg-orange-100 text-orange-700',
}

export default function AccountsPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [balances, setBalances] = useState<Record<number, number>>({})
  const [toastMsg, setToastMsg] = useState('')

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  const { data: accounts = [], isLoading } = useQuery<Account[]>({
    queryKey: ['payment-accounts'],
    queryFn: () => accountsApi.list({ include_inactive: true }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => accountsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment-accounts'] })
      showToast('Account deleted')
    },
  })

  const loadBalance = async (id: number) => {
    const result = await accountsApi.getBalance(id) as { balance: number }
    setBalances((prev) => ({ ...prev, [id]: result.balance }))
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
          <h1 className="text-xl font-bold text-foreground">Payment Accounts</h1>
          <p className="text-sm text-muted-foreground">Cash, mobile money, bank & system wallets</p>
        </div>
        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-muted/40"
            onClick={() => navigate('/admin/accounts/transfer')}
          >
            <ArrowUpDown className="w-4 h-4" />
            Transfer
          </button>
          <button
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            onClick={() => navigate('/admin/accounts/new')}
          >
            <Plus className="w-4 h-4" />
            Add account
          </button>
        </div>
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Currency</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Balance</th>
                <th className="px-4 py-3 w-32"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">No payment accounts configured</td>
                </tr>
              ) : (
                accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{acc.name}</td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeColors[acc.type] ?? 'bg-muted text-muted-foreground'}`}>
                        {acc.type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{acc.currency}</td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${acc.isActive ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {acc.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-foreground">
                      <button
                        className="font-mono font-semibold hover:underline"
                        onClick={() => loadBalance(acc.id)}
                      >
                        {acc.id in balances ? (
                          `GH₵ ${Number(balances[acc.id]).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`
                        ) : (
                          <span className="text-muted-foreground text-xs">Click to load</span>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          className="p-1.5 rounded text-muted-foreground hover:text-muted-foreground hover:bg-muted"
                          title="View transactions" onClick={() => navigate(`/admin/accounts/${acc.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 rounded text-muted-foreground hover:text-muted-foreground hover:bg-muted"
                          title="Edit account" onClick={() => navigate(`/admin/accounts/${acc.id}/edit`)}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button title="Delete account"
                          className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Delete account" onClick={() => deleteMutation.mutate(acc.id)}
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
