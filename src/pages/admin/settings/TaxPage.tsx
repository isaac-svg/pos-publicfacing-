import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { settingsApi } from '../../../lib/api'

export default function TaxPage() {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [rate, setRate] = useState('')

  const { data: taxes = [], isLoading } = useQuery({ queryKey: ['taxes'], queryFn: () => settingsApi.taxes.list() })

  const createMutation = useMutation({
    mutationFn: () => settingsApi.taxes.create({ name, rate: parseFloat(rate) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['taxes'] }); setName(''); setRate(''); setShowAdd(false) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => settingsApi.taxes.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['taxes'] }),
  })

  const list = taxes as { id: number; name: string; rate: string; isActive: boolean }[]

  return (
    <div className="space-y-4 max-w-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tax Settings</h1>
        <button onClick={() => setShowAdd(!showAdd)} className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-blue-600 text-white text-sm font-medium"><Plus className="h-4 w-4" /> Add tax</button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-end gap-3">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm" placeholder="e.g. VAT" />
          </div>
          <div className="w-24 space-y-1">
            <label className="text-sm font-medium">Rate (%)</label>
            <input type="number" step="0.01" value={rate} onChange={e => setRate(e.target.value)} className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm" />
          </div>
          <button disabled={!name.trim() || !rate} onClick={() => createMutation.mutate()} className="h-9 px-4 rounded-md bg-blue-600 text-white text-sm font-medium disabled:opacity-50">Add</button>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
        {isLoading ? <p className="p-8 text-center text-gray-400 text-sm">Loading…</p> :
          list.length === 0 ? <p className="p-8 text-center text-gray-400 text-sm">No taxes configured</p> :
          list.map(t => (
            <div key={t.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <span className="text-sm font-medium">{t.name}</span>
                <span className="ml-2 text-sm text-gray-500">{Number(t.rate).toFixed(2)}%</span>
              </div>
              <button onClick={() => deleteMutation.mutate(t.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
      </div>
    </div>
  )
}
