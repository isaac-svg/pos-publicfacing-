import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { salesApi, shopsApi } from '../../lib/api'

type SaleStatus = 'completed' | 'partially_returned' | 'fully_returned'

interface Sale {
  id: number
  shopId: number
  createdAt: string
  totalAmount: string | number
  status: SaleStatus
}

interface Shop {
  id: number
  name: string
}

const statusLabel: Record<SaleStatus, string> = {
  completed: 'Completed',
  partially_returned: 'Partial return',
  fully_returned: 'Returned',
}

function toInvoiceId(saleId: number): string {
  return `INV-${String(saleId).padStart(6, '0')}`
}

function parseSearchToId(raw: string): number {
  const trimmed = raw.trim().toUpperCase()
  if (trimmed.startsWith('INV-')) {
    return parseInt(trimmed.slice(4), 10)
  }
  return parseInt(trimmed, 10)
}

function statusBadgeClass(status: SaleStatus) {
  if (status === 'completed') return 'bg-indigo-50 text-indigo-700'
  if (status === 'fully_returned') return 'bg-slate-100 text-slate-500'
  return 'bg-amber-50 text-amber-700'
}

export default function ReturnsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [shopFilter, setShopFilter] = useState('all')

  const { data: sales = [], isLoading } = useQuery<Sale[]>({
    queryKey: ['sales'],
    queryFn: () => salesApi.list(),
  })

  const { data: shops = [] } = useQuery<Shop[]>({
    queryKey: ['shops'],
    queryFn: () => shopsApi.list(),
  })

  const shopMap = new Map(shops.map((s) => [s.id, s.name]))

  const filtered = sales.filter((s) => {
    if (shopFilter !== 'all' && s.shopId !== Number(shopFilter)) return false
    if (search.trim()) {
      const targetId = parseSearchToId(search)
      if (!isNaN(targetId)) return s.id === targetId
      return toInvoiceId(s.id).includes(search.trim().toUpperCase())
    }
    return true
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Returns</h1>
        <p className="text-sm text-slate-500">Look up a sale by invoice ID and process a return</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Search by invoice ID</label>
          <input
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 font-mono w-52"
            placeholder="INV-000042 or 42"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">Shop</label>
          <select
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 w-44"
            value={shopFilter}
            onChange={(e) => setShopFilter(e.target.value)}
          >
            <option value="all">All shops</option>
            {shops.map((s) => (
              <option key={s.id} value={s.id.toString()}>{s.name}</option>
            ))}
          </select>
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Shop</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">
                    {search ? `No sale matching "${search}" found.` : 'No sales to display.'}
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <span className="font-mono font-medium">{toInvoiceId(s.id)}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{shopMap.get(s.shopId) ?? `Shop #${s.shopId}`}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{format(new Date(s.createdAt), 'MMM d, HH:mm')}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      GH₵ {Number(s.totalAmount).toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(s.status)}`}>
                        {statusLabel[s.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <button
                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                        disabled={s.status === 'fully_returned'}
                        onClick={(e) => { e.stopPropagation(); navigate(`/admin/returns/${s.id}`) }}
                      >
                        Process return
                      </button>
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
