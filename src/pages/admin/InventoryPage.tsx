import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { allocationsApi } from '../../lib/api'

export default function InventoryPage() {
  const [lowStockOnly, setLowStockOnly] = useState(false)

  const { data: allocations = [], isLoading } = useQuery({
    queryKey: ['allocations', lowStockOnly],
    queryFn: () => allocationsApi.list(lowStockOnly ? { low_stock: true } : {}),
  })

  const items = allocations as { id: number; product: { name: string; sku: string }; shop: { name: string }; qtyAllocated: number; qtySold: number; qtyRemaining: number; isLowStock: boolean }[]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={lowStockOnly} onChange={e => setLowStockOnly(e.target.checked)} className="rounded" />
          Low stock only
        </label>
      </div>

      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Product</th>
              <th className="px-4 py-2 text-left font-medium">Shop</th>
              <th className="px-4 py-2 text-right font-medium">Allocated</th>
              <th className="px-4 py-2 text-right font-medium">Sold</th>
              <th className="px-4 py-2 text-right font-medium">Remaining</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr> :
              items.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No allocations</td></tr> :
              items.map(a => (
                <tr key={a.id} className={a.isLowStock ? 'bg-red-50' : 'hover:bg-gray-50'}>
                  <td className="px-4 py-2"><p className="font-medium">{a.product.name}</p><p className="text-xs text-gray-400 font-mono">{a.product.sku}</p></td>
                  <td className="px-4 py-2 text-gray-500">{a.shop.name}</td>
                  <td className="px-4 py-2 text-right">{a.qtyAllocated}</td>
                  <td className="px-4 py-2 text-right">{a.qtySold}</td>
                  <td className="px-4 py-2 text-right font-medium">{a.qtyRemaining}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
