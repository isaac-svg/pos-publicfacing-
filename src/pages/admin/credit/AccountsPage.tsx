import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { creditApi } from '../../../lib/api'

export default function CreditAccountsPage() {
  const [status, setStatus] = useState('')
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['credit-accounts', status],
    queryFn: () => creditApi.accounts.list(status ? { status } : {}),
  })

  const list = accounts as { id: number; totalDue: string; balanceRemaining: string; status: string; customer?: { fullName: string; phone: string } }[]

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Credit Accounts</h1>
      <div className="flex gap-1">
        {['', 'active', 'completed', 'defaulted'].map(s => (
          <button key={s || 'all'} onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium ${status === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr><th className="px-4 py-2 text-left font-medium">Customer</th><th className="px-4 py-2 text-right font-medium">Total Due</th><th className="px-4 py-2 text-right font-medium">Remaining</th><th className="px-4 py-2 text-center font-medium">Status</th></tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr> :
              list.length === 0 ? <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No accounts</td></tr> :
              list.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{a.customer?.fullName ?? '—'}</td>
                  <td className="px-4 py-2 text-right">GH₵{Number(a.totalDue).toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">GH₵{Number(a.balanceRemaining).toFixed(2)}</td>
                  <td className="px-4 py-2 text-center"><span className={`px-2 py-0.5 rounded text-xs capitalize ${a.status === 'active' ? 'bg-green-100 text-green-700' : a.status === 'defaulted' ? 'bg-red-100 text-red-700' : 'bg-gray-100'}`}>{a.status}</span></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
