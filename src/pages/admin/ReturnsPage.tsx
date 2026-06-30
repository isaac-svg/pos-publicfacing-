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
  if (status === 'completed') return 'bg-accent text-primary'
  if (status === 'fully_returned') return 'bg-muted text-muted-foreground'
  return 'bg-muted text-foreground'
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
        <h1 className="text-xl font-bold text-foreground">Returns</h1>
        <p className="text-sm text-muted-foreground">Look up a sale by invoice ID and process a return</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Search by invoice ID</label>
          <input
            className="h-9 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring font-mono w-52"
            placeholder="INV-000042 or 42"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs text-muted-foreground mb-1">Shop</label>
          <select
            className="h-9 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring w-44"
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

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invoice ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shop</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    {search ? `No sale matching "${search}" found.` : 'No sales to display.'}
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 text-sm text-foreground">
                      <span className="font-mono font-medium">{toInvoiceId(s.id)}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{shopMap.get(s.shopId) ?? `Shop #${s.shopId}`}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{format(new Date(s.createdAt), 'MMM d, HH:mm')}</td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      GH₵ {Number(s.totalAmount).toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(s.status)}`}>
                        {statusLabel[s.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      <button
                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-muted/40 disabled:opacity-50"
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
