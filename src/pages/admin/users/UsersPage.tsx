import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Pencil } from 'lucide-react'
import { usersApi, rolesApi } from '../../../lib/api'

interface User { id: number; username: string; fullName: string; email?: string | null; isActive: boolean; shopId: number | null; userRoles?: { role: { id: number; name: string } }[] }

export default function UsersPage() {
  const [search, setSearch] = useState('')

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => usersApi.list(),
  })

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.list(),
  })

  const list = (users as User[]).filter(u =>
    !search ||
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">Manage staff accounts for your shops</p>
        </div>
        <Link
          to="/users/new"
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add user
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or username..."
          className="w-full h-9 rounded-lg border border-border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Users table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr>
              {['Name', 'Username', 'Email', 'Role', 'Status', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : list.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No users found</td></tr>
            ) : list.map(u => (
              <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{u.fullName}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{u.username}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email ?? '-'}</td>
                <td className="px-4 py-3">
                  {u.userRoles?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {u.userRoles.map(ur => (
                        <span key={ur.role.id} className="inline-flex px-2 py-0.5 rounded-full text-xs bg-accent text-accent-foreground">{ur.role.name}</span>
                      ))}
                    </div>
                  ) : <span className="text-xs text-muted-foreground">-</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link to={`/users/${u.id}/edit`} title="Edit user" className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors inline-flex">
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Note: roles is loaded for child pages */}
      <span className="hidden">{String(roles)}</span>
    </div>
  )
}
