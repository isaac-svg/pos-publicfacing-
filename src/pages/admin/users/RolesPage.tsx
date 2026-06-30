import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { rolesApi } from '../../../lib/api'

export default function RolesPage() {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')

  const { data: roles = [], isLoading } = useQuery({ queryKey: ['roles'], queryFn: () => rolesApi.list() })

  const createMutation = useMutation({
    mutationFn: () => rolesApi.create({ name, description: desc || undefined, moduleAccess: [] }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['roles'] }); setName(''); setDesc(''); setShowAdd(false) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => rolesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
  })

  const list = roles as { id: number; name: string; description?: string | null; isSystem: boolean; moduleAccess: { moduleKey: string; accessLevel: number }[] }[]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Roles</h1>
        <button onClick={() => setShowAdd(!showAdd)} className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Add role
        </button>
      </div>

      {showAdd && (
        <div className="bg-card rounded-lg border border-border p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Role name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full h-9 rounded-md border border-border px-3 text-sm" placeholder="e.g. Manager" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Description</label>
              <input value={desc} onChange={e => setDesc(e.target.value)} className="w-full h-9 rounded-md border border-border px-3 text-sm" placeholder="Optional" />
            </div>
          </div>
          <div className="flex gap-2">
            <button disabled={!name.trim()} onClick={() => createMutation.mutate()} className="h-9 px-4 rounded-md bg-blue-600 text-white text-sm font-medium disabled:opacity-50">Create</button>
            <button onClick={() => setShowAdd(false)} className="h-9 px-4 rounded-md border border-border text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-lg border border-border divide-y divide-gray-100">
        {isLoading ? <p className="p-8 text-center text-muted-foreground text-sm">Loading…</p> :
          list.length === 0 ? <p className="p-8 text-center text-muted-foreground text-sm">No roles</p> :
          list.map(r => (
            <div key={r.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{r.name}</span>
                  {r.isSystem && <span className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">System</span>}
                </div>
                {r.description && <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>}
                <p className="text-xs text-muted-foreground">{r.moduleAccess.length} module(s) configured</p>
              </div>
              {!r.isSystem && (
                <button onClick={() => deleteMutation.mutate(r.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}
