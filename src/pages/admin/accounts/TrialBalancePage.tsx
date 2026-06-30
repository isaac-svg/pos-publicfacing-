import { useQuery } from '@tanstack/react-query'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { accountsApi } from '../../../lib/api'

interface TrialBalance {
  totalDebits: number
  totalCredits: number
  inBalance: boolean
  difference: number
  transactionCount: number
}

function fmt(v: number) {
  return `GH₵ ${Number(v).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`
}

export default function TrialBalancePage() {
  const { data: tb, isLoading } = useQuery<TrialBalance>({
    queryKey: ['trial-balance'],
    queryFn: () => accountsApi.getTrialBalance(),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    )
  }
  if (!tb) return null

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Trial Balance</h1>
        <p className="text-sm text-slate-500">Verify accounting correctness</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total debits (inflows)</p>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{fmt(tb.totalDebits)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total credits (outflows)</p>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{fmt(tb.totalCredits)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 pt-4 pb-2 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-900">Verification</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            {tb.inBalance ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
            <div>
              <p className="font-semibold text-slate-900">{tb.inBalance ? 'In balance' : 'Out of balance'}</p>
              <p className="text-sm text-slate-500">
                {tb.inBalance
                  ? 'Total debits equal total credits. The books are balanced.'
                  : `Difference: GH₵ ${tb.difference.toFixed(2)}`}
              </p>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-4 text-sm text-slate-500">
            Based on {tb.transactionCount} transaction(s) across all accounts
          </div>
        </div>
      </div>
    </div>
  )
}
