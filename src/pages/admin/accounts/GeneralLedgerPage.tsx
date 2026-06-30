import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Filter, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { accountsApi } from '../../../lib/api'

interface Account {
  id: number
  name: string
}

interface Transaction {
  id: number
  recordedAt: string
  type: string
  description: string
  reference?: string | null
  amount: number
  account: { name: string }
}

const typeLabel: Record<string, string> = {
  sale: 'Sale',
  expense: 'Expense',
  supplier_payment: 'Supplier Payment',
  supplier_purchase: 'Supplier Purchase',
  transfer_in: 'Transfer In',
  transfer_out: 'Transfer Out',
  opening_balance: 'Opening Balance',
  refund: 'Refund',
}

export default function GeneralLedgerPage() {
  const [typeFilter, setTypeFilter] = useState('')
  const [accountFilter, setAccountFilter] = useState('')

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['general-ledger', typeFilter, accountFilter],
    queryFn: () => accountsApi.getGeneralLedger({
      type: typeFilter || undefined,
      accountId: accountFilter ? parseInt(accountFilter) : undefined,
    }),
  })

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ['payment-accounts'],
    queryFn: () => accountsApi.list(),
  })

  const selectCls = 'h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400'

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">General Ledger</h1>
        <p className="text-sm text-slate-500">All transactions across every account</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              className={`${selectCls} w-40`}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All types</option>
              {Object.entries(typeLabel).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <select
            className={`${selectCls} w-48`}
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
          >
            <option value="">All accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={String(a.id)}>{a.name}</option>
            ))}
          </select>
          <span className="text-sm text-slate-500 ml-auto">
            {transactions.length} transaction(s)
          </span>
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Account</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reference</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">No transactions</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs text-slate-700 whitespace-nowrap">
                      {format(new Date(tx.recordedAt), 'dd MMM yyyy HH:mm')}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-900">{tx.account.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${tx.amount > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {typeLabel[tx.type] ?? tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 max-w-[200px] truncate">{tx.description}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{tx.reference ?? '—'}</td>
                    <td className={`px-4 py-3 text-right font-mono font-semibold text-sm ${tx.amount > 0 ? 'text-slate-900' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : ''}GH₵ {Math.abs(tx.amount).toLocaleString('en-GH', { minimumFractionDigits: 2 })}
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
