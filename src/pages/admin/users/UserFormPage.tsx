import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, ArrowLeft, Copy, Check } from 'lucide-react'
import { usersApi, rolesApi, shopsApi } from '../../../lib/api'
import { useAuthStore } from '../../../store/auth'

const inputCls = 'w-full h-9 rounded-lg border border-input bg-background px-3 text-sm font-normal text-foreground placeholder:text-muted-foreground placeholder:font-normal focus:outline-none focus:ring-1 focus:ring-ring'
const labelCls = 'text-xs font-medium text-foreground'

interface User { id: number; username: string; fullName: string; phone?: string | null; email?: string | null; isActive: boolean; shopId: number | null; canGrantCredit: boolean; userRoles?: { roleId: number; role: { id: number; name: string } }[] }
interface Shop { id: number; name: string }
interface Role { id: number; name: string }

function Toggle({ checked, label, onChange }: { checked: boolean; label: string; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-normal text-foreground">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-muted-foreground/30'}`}
      >
        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ml-0.5 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

export default function UserFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { business } = useAuthStore()

  const [form, setForm] = useState({
    username: '', fullName: '', phone: '', email: '', isActive: true, canGrantCredit: false, password: '',
  })
  const [selectedShopIds, setSelectedShopIds] = useState<number[]>([])
  const [selectedRoles, setSelectedRoles] = useState<number[]>([])
  const [error, setError] = useState('')
  const [createdCreds, setCreatedCreds] = useState<{ username: string; password: string; emailSent: boolean; email?: string | null } | null>(null)
  const [copied, setCopied] = useState(false)

  const { data: users = [], isLoading: loadingUser } = useQuery<User[]>({ queryKey: ['users'], queryFn: () => usersApi.list() })
  const { data: shops = [] } = useQuery<Shop[]>({ queryKey: ['shops'], queryFn: () => shopsApi.list() })
  const { data: roles = [] } = useQuery<Role[]>({ queryKey: ['roles'], queryFn: () => rolesApi.list() })

  const user = isEdit ? (users as User[]).find(u => u.id === Number(id)) : undefined

  useEffect(() => {
    if (!user) return
    setForm({
      username: user.username,
      fullName: user.fullName,
      phone: user.phone ?? '',
      email: user.email ?? '',
      isActive: user.isActive,
      canGrantCredit: user.canGrantCredit,
      password: '',
    })
    setSelectedRoles(user.userRoles?.map(ur => ur.roleId) ?? [])
    const shopIds = (user as { userShops?: { shopId: number }[] }).userShops?.map(us => us.shopId)
      ?? (user.shopId ? [user.shopId] : [])
    setSelectedShopIds(shopIds)
  }, [user])

  const createMutation = useMutation({
    mutationFn: () => {
      if (!selectedShopIds.length) { setError('At least one shop is required'); return Promise.reject() }
      if (!form.phone.trim()) { setError('Phone number is required'); return Promise.reject() }
      return usersApi.create({
        username: form.username.trim(),
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        shopIds: selectedShopIds,
        roleIds: selectedRoles.length ? selectedRoles : undefined,
        canGrantCredit: form.canGrantCredit,
      }) as Promise<{ username: string; generatedPassword: string; emailSent?: boolean; email?: string | null }>
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['users'] })
      setCreatedCreds({ username: data.username, password: data.generatedPassword, emailSent: !!data.emailSent, email: data.email })
      setError('')
    },
    onError: (err: unknown) => setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Failed to create user'),
  })

  const updateMutation = useMutation({
    mutationFn: () => usersApi.update(Number(id), {
      fullName: form.fullName.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      shopIds: selectedShopIds,
      isActive: form.isActive,
      canGrantCredit: form.canGrantCredit,
      roleIds: selectedRoles,
      ...(form.password.trim() ? { password: form.password.trim() } : {}),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      navigate('/users')
    },
    onError: (err: unknown) => setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Failed to update user'),
  })

  const assignableRoles = (roles as Role[]).filter(r => r.name !== 'Business Administrator')

  function toggleRole(roleId: number) {
    setSelectedRoles(prev => prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId])
  }

  function copyCreds() {
    if (!createdCreds) return
    const parts = [`Username: ${createdCreds.username}`, `Password: ${createdCreds.password}`]
    if (business?.businessSlug) parts.unshift(`Store Code: ${business.businessSlug}`)
    navigator.clipboard.writeText(parts.join('\n'))
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  if (isEdit && loadingUser) return <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>

  if (createdCreds) return (
    <div className="max-w-md space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/users" className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><ArrowLeft className="h-4 w-4" /></Link>
        <h1 className="text-xl font-bold text-foreground">User Created</h1>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        {createdCreds.email && createdCreds.emailSent ? (
          <div className="rounded-lg bg-accent/40 border border-border px-4 py-3 text-sm text-foreground">
            Credentials were sent to <strong>{createdCreds.email}</strong> via email.
          </div>
        ) : createdCreds.email && !createdCreds.emailSent ? (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
            Email delivery failed. Share credentials manually.
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No email provided. Share these credentials with the user.</p>
        )}

        <div className="rounded-lg border border-border bg-muted/30 font-mono text-sm p-4 space-y-1.5">
          {business?.businessSlug && (
            <p><span className="text-muted-foreground">Store Code:</span> <strong className="text-foreground">{business.businessSlug}</strong></p>
          )}
          <p><span className="text-muted-foreground">Username:</span> <strong className="text-foreground">{createdCreds.username}</strong></p>
          <p><span className="text-muted-foreground">Password:</span> <strong className="text-foreground">{createdCreds.password}</strong></p>
        </div>

        <div className="flex gap-3">
          <button onClick={copyCreds} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy credentials</>}
          </button>
          <button onClick={() => { setCreatedCreds(null); setForm({ username: '', fullName: '', phone: '', email: '', isActive: true, canGrantCredit: false, password: '' }); setSelectedRoles([]); setSelectedShopIds([]) }} className="text-sm text-muted-foreground hover:text-foreground">
            Add another
          </button>
        </div>
      </div>

      <Link to="/users" className="block text-center text-sm text-primary font-medium hover:text-primary/80">Back to users</Link>
    </div>
  )

  return (
    <div className="max-w-lg space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/users" className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Back to users">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold text-foreground">{isEdit ? 'Edit user' : 'Add user'}</h1>
      </div>

      {error && <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">{error}</div>}

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={labelCls}>Full name <span className="text-destructive">*</span></label>
            <input value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} required placeholder="Ama Owusu" className={inputCls} />
          </div>

          {!isEdit && (
            <div className="space-y-1.5">
              <label className={labelCls}>Username <span className="text-destructive">*</span></label>
              <input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value.toLowerCase().replace(/\s/g, '') }))} required placeholder="amaowusu" className={inputCls} />
            </div>
          )}

          <div className="space-y-1.5">
            <label className={labelCls}>Phone number {!isEdit && <span className="text-destructive">*</span>}</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              placeholder="024 000 0000"
              className={inputCls}
            />
          </div>

          <div className="space-y-1.5 col-span-2">
            <label className={labelCls}>Shops <span className="text-destructive">*</span></label>
            {(shops as Shop[]).length === 0 ? (
              <p className="text-xs text-muted-foreground">No shops available.</p>
            ) : (
              <div className="rounded-lg border border-input divide-y divide-border overflow-hidden">
                {(shops as Shop[]).map(s => {
                  const checked = selectedShopIds.includes(s.id)
                  return (
                    <label key={s.id} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/40 transition-colors">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => setSelectedShopIds(prev =>
                          checked ? prev.filter(id => id !== s.id) : [...prev, s.id]
                        )}
                        className="w-4 h-4 rounded accent-primary"
                      />
                      <span className="text-sm text-foreground">{s.name}</span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          <div className="space-y-1.5 col-span-2 sm:col-span-1">
            <label className={labelCls}>Email <span className="text-muted-foreground font-normal text-xs">(optional)</span></label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="ama@example.com" className={inputCls} />
          </div>

          {isEdit && (
            <div className="space-y-1.5">
              <label className={labelCls}>New password <span className="text-muted-foreground font-normal text-xs">(leave blank to keep)</span></label>
              <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Leave blank to keep current" className={inputCls} />
            </div>
          )}
        </div>

        {assignableRoles.length > 0 && (
          <div className="space-y-2">
            <label className={labelCls}>Roles</label>
            <div className="flex flex-wrap gap-2">
              {assignableRoles.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => toggleRole(r.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    selectedRoles.includes(r.id)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-border pt-3 space-y-1">
          {isEdit && <Toggle checked={form.isActive} label="Account active" onChange={v => setForm(p => ({ ...p, isActive: v }))} />}
          <Toggle checked={form.canGrantCredit} label="Can grant credit" onChange={v => setForm(p => ({ ...p, canGrantCredit: v }))} />
        </div>
      </div>

      <div className="flex gap-3">
        <Link to="/users" className="flex-1 h-10 rounded-lg border border-border text-sm text-foreground font-normal flex items-center justify-center hover:bg-muted/40 transition-colors">
          Cancel
        </Link>
        <button
          onClick={() => { setError(''); isEdit ? updateMutation.mutate() : createMutation.mutate() }}
          disabled={createMutation.isPending || updateMutation.isPending || !form.fullName.trim() || (!isEdit && (!form.username.trim() || !form.phone.trim() || !selectedShopIds.length))}
          className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? 'Save changes' : 'Create user'}
        </button>
      </div>
    </div>
  )
}
