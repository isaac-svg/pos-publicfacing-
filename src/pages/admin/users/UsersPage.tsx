import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import { usersApi } from '../../../lib/api'

export default function UsersPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ username: '', fullName: '', email: '' })
  const [created, setCreated] = useState<{ username: string; password: string } | null>(null)

  const { data: users = [], isLoading } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.list() })

  const createMutation = useMutation({
    mutationFn: () => usersApi.create({ username: form.username, fullName: form.fullName, email: form.email || undefined }),
    onSuccess: (data: { generatedPassword?: string }) => {
      qc.invalidateQueries({ queryKey: ['users'] })
      setCreated({ username: form.username, password: (data as { generatedPassword: string }).generatedPassword })
      setForm({ username: '', fullName: '', email: '' })
      setShowAdd(false)
    },
  })

  const list = (users as { id: number; username: string; fullName: string; email?: string | null; isActive: boolean; shopId: number | null }[])
    .filter(u => !search || u.fullName.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <button onClick={() => setShowAdd(!showAdd)} className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-blue-600 text-white text-sm font-medium"><Plus className="h-4 w-4" /> Add user</button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {([['Full name', 'fullName', 'John Doe'], ['Username', 'username', 'john'], ['Email', 'email', 'john@example.com']] as [string, string, string][]).map(([label, key, ph]) => (
              <div key={key} className="space-y-1">
                <label className="text-sm font-medium">{label}</label>
                <input value={form[key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} className="w-full h-9 rounded-md border px-3 text-sm" />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button disabled={!form.username || !form.fullName || createMutation.isPending} onClick={() => createMutation.mutate()} className="h-9 px-4 rounded-md bg-blue-600 text-white text-sm font-medium disabled:opacity-50">Create</button>
            <button onClick={() => setShowAdd(false)} className="h-9 px-4 rounded-md border text-sm">Cancel</button>
          </div>
        </div>
      )}

      {created && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
          <p className="text-sm font-semibold text-green-800">User created — share these credentials</p>
          <div className="font-mono text-sm bg-white rounded p-2">
            <p>Username: {created.username}</p>
            <p>Password: {created.password}</p>
          </div>
          <button onClick={() => { navigator.clipboard.writeText(`Username: ${created.username}\nPassword: ${created.password}`); }} className="text-xs text-blue-600 hover:underline">Copy</button>
          <button onClick={() => setCreated(null)} className="text-xs text-gray-400 ml-3 hover:underline">Dismiss</button>
        </div>
      )}

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="w-full h-9 rounded-md border pl-9 px-3 text-sm" />
      </div>

      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr><th className="px-4 py-2 text-left font-medium">Name</th><th className="px-4 py-2 text-left font-medium">Username</th><th className="px-4 py-2 text-left font-medium">Email</th><th className="px-4 py-2 text-center font-medium">Status</th></tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr> :
              list.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{u.fullName}</td>
                  <td className="px-4 py-2 text-gray-500">{u.username}</td>
                  <td className="px-4 py-2 text-gray-500">{u.email ?? '—'}</td>
                  <td className="px-4 py-2 text-center"><span className={`px-2 py-0.5 rounded text-xs ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
