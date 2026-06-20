import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { categoriesApi } from '../../../lib/api'

export default function CategoriesPage() {
  const qc = useQueryClient()
  const [name, setName] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => categoriesApi.list({ include_inactive: true }) })

  const createMutation = useMutation({
    mutationFn: () => categoriesApi.create({ name }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setName(''); setShowAdd(false) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoriesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button onClick={() => setShowAdd(!showAdd)} className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border p-4 flex gap-3 items-end">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full h-9 rounded-md border px-3 text-sm" placeholder="e.g. Beverages" />
          </div>
          <button disabled={!name.trim()} onClick={() => createMutation.mutate()} className="h-9 px-4 rounded-md bg-blue-600 text-white text-sm font-medium disabled:opacity-50">Create</button>
          <button onClick={() => setShowAdd(false)} className="h-9 px-4 rounded-md border text-sm">Cancel</button>
        </div>
      )}

      <div className="bg-white rounded-lg border divide-y">
        {(categories as { id: number; name: string; isActive: boolean }[]).length === 0 ? (
          <p className="p-8 text-center text-gray-400 text-sm">No categories yet</p>
        ) : (categories as { id: number; name: string; isActive: boolean }[]).map(c => (
          <div key={c.id} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium">{c.name}</span>
            <button onClick={() => deleteMutation.mutate(c.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  )
}
