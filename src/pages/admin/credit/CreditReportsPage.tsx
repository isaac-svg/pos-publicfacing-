import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { creditApi } from '../../../lib/api'

export default function CreditReportsPage() {
  const today = new Date().toISOString().slice(0, 10)
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
  const [from, setFrom] = useState(monthStart)
  const [to, setTo] = useState(today)

  const { data: collections = [] } = useQuery({
    queryKey: ['credit-collections', from, to],
    queryFn: () => creditApi.reports.collections({ from, to }),
  })

  const list = collections as { id: number; createdAt: string; amount: string; method: string; creditAccount: { id: number; customer: { fullName: string } }; recorder: { fullName: string } }[]

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Credit Reports</h1>
      <div className="flex gap-3">
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="h-9 rounded-md border px-3 text-sm" />
        <input type="date" value={to} onChange={e => setTo(e.target.value)} className="h-9 rounded-md border px-3 text-sm" />
      </div>
      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr><th className="px-4 py-2 text-left font-medium">Date</th><th className="px-4 py-2 text-left font-medium">Customer</th><th className="px-4 py-2 text-right font-medium">Amount</th><th className="px-4 py-2 text-left font-medium">Method</th><th className="px-4 py-2 text-left font-medium">By</th></tr>
          </thead>
          <tbody className="divide-y">
            {list.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No collections</td></tr> :
              list.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2 font-medium">{c.creditAccount.customer.fullName}</td>
                  <td className="px-4 py-2 text-right">GH₵{Number(c.amount).toFixed(2)}</td>
                  <td className="px-4 py-2 capitalize">{c.method.replace('_', ' ')}</td>
                  <td className="px-4 py-2 text-gray-500">{c.recorder.fullName}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
