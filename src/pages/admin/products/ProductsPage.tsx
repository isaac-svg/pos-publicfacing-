import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { productsApi } from '../../../lib/api'

const TYPE_LABELS: Record<string, string> = { retail: 'Retail', menu: 'Menu', service: 'Service', bundle: 'Bundle' }

export default function ProductsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', typeFilter],
    queryFn: () => productsApi.list(typeFilter ? { itemType: typeFilter } : {}),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })

  const filtered = (products as { id: number; name: string; sku: string; itemType: string; unitPrice: number; wholesaleQty: number; category?: { name: string } | null; isDeleted: boolean }[])
    .filter(p => !p.isDeleted)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link to="/products/new" className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Add item
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full h-9 rounded-md border border-border bg-background pl-9 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <div className="flex gap-1">
          {(['', 'retail', 'menu', 'service', 'bundle'] as const).map(t => (
            <button key={t || 'all'} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${typeFilter === t ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
              {t ? TYPE_LABELS[t] : 'All'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p> : (
        <div className="bg-card rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                {['Name', 'Type', 'SKU', 'Price', '', ''].map((h, i) => (
                  <th key={i} className={`px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider ${i >= 3 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No products found</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-foreground">{p.name}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground capitalize">{TYPE_LABELS[p.itemType] ?? p.itemType}</span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{p.sku}</td>
                  <td className="px-4 py-2.5 text-right text-foreground">GH₵{Number(p.unitPrice).toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">{p.wholesaleQty}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/products/${p.id}/edit`} title="Edit product" className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <button title="Delete product" onClick={() => deleteMutation.mutate(p.id)} className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
