import { useState } from 'react'
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
        <a href="/products/new" className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Add item
        </a>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="w-full h-9 rounded-md border pl-9 px-3 text-sm" />
        </div>
        <div className="flex gap-1">
          {['', 'retail', 'menu', 'service', 'bundle'].map(t => (
            <button key={t || 'all'} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium ${typeFilter === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t ? TYPE_LABELS[t] : 'All'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? <p className="text-sm text-gray-400 py-8 text-center">Loading…</p> : (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Name</th>
                <th className="px-4 py-2 text-left font-medium">Type</th>
                <th className="px-4 py-2 text-left font-medium">SKU</th>
                <th className="px-4 py-2 text-right font-medium">Price</th>
                <th className="px-4 py-2 text-right font-medium">Stock</th>
                <th className="px-4 py-2 font-medium w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No products found</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{p.name}</td>
                  <td className="px-4 py-2">
                    <span className="inline-block px-2 py-0.5 rounded text-xs bg-gray-100 capitalize">{TYPE_LABELS[p.itemType] ?? p.itemType}</span>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-500">{p.sku}</td>
                  <td className="px-4 py-2 text-right">GH₵{Number(p.unitPrice).toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{p.wholesaleQty}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-1">
                      <a href={`/products/${p.id}/edit`} className="p-1 text-gray-400 hover:text-gray-600"><Pencil className="h-3.5 w-3.5" /></a>
                      <button onClick={() => deleteMutation.mutate(p.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
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
