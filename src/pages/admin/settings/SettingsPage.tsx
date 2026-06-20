import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsApi, shopsApi } from '../../../lib/api'

export default function SettingsPage() {
  const qc = useQueryClient()
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: () => settingsApi.get() })
  const { data: shops = [] } = useQuery({ queryKey: ['shops'], queryFn: () => shopsApi.list() })

  const s = settings as { lowStockThreshold?: number } | undefined
  const [threshold, setThreshold] = useState('')

  useEffect(() => { if (s) setThreshold(String(s.lowStockThreshold ?? 10)) }, [s])

  const saveMutation = useMutation({
    mutationFn: () => settingsApi.update({ lowStockThreshold: parseInt(threshold) || 10 }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  })

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="bg-white rounded-lg border p-4 space-y-3">
        <h2 className="text-sm font-semibold">Inventory</h2>
        <div className="space-y-1">
          <label className="text-sm font-medium">Low stock threshold</label>
          <input type="number" value={threshold} onChange={e => setThreshold(e.target.value)} className="w-full h-9 rounded-md border px-3 text-sm" />
        </div>
        <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="h-9 px-4 rounded-md bg-blue-600 text-white text-sm font-medium disabled:opacity-50">Save</button>
      </div>

      <div className="bg-white rounded-lg border p-4 space-y-3">
        <h2 className="text-sm font-semibold">Shops</h2>
        <div className="divide-y border rounded-md">
          {(shops as { id: number; name: string; address: string | null; isActive: boolean }[]).map(shop => (
            <div key={shop.id} className="flex items-center justify-between px-3 py-2">
              <div>
                <p className="text-sm font-medium">{shop.name}</p>
                <p className="text-xs text-gray-400">{shop.address ?? 'No address'}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs ${shop.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>{shop.isActive ? 'Active' : 'Inactive'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
