import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Loader2 } from 'lucide-react'
import { api } from '../../lib/api'

const inputCls = 'w-full h-9 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring'

interface Shop { id: number; name: string; address: string | null; isActive: boolean }

function ShopModal({ shop, onClose, onDone }: { shop?: Shop; onClose: () => void; onDone: () => void }) {
  const [name, setName] = useState(shop?.name ?? '')
  const [address, setAddress] = useState(shop?.address ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true); setError('')
    try {
      if (shop) {
        await api.patch(`/api/v1/shops/${shop.id}`, { name: name.trim(), address: address.trim() || null })
      } else {
        await api.post('/api/v1/shops', { name: name.trim(), address: address.trim() || undefined })
      }
      onDone()
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Failed')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
        <h2 className="text-base font-semibold">{shop ? 'Edit Shop' : 'Add Shop'}</h2>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Shop name *</label>
            <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Main Branch" className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Address (optional)</label>
            <input value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. Osu, Accra" className={inputCls} />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 h-9 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted/40">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 h-9 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-1">
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} {shop ? 'Save' : 'Add shop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ShopsPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<{ open: boolean; shop?: Shop }>({ open: false })

  const { data: shops = [], isLoading } = useQuery<Shop[]>({
    queryKey: ['shops'],
    queryFn: () => api.get('/api/v1/shops').then(r => r.data.data),
  })

  function done() { setModal({ open: false }); qc.invalidateQueries({ queryKey: ['shops'] }) }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Shops</h1>
          <p className="text-sm text-muted-foreground">Manage your shop branches</p>
        </div>
        <button onClick={() => setModal({ open: true })} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Add shop
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : shops.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">No shops yet. Add your first shop.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                {['Shop', 'Address', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {shops.map(shop => (
                <tr key={shop.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-medium text-foreground">{shop.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{shop.address ?? '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${shop.isActive ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {shop.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button title="Edit shop" onClick={() => setModal({ open: true, shop })} className="p-1.5 rounded text-muted-foreground hover:text-muted-foreground hover:bg-muted">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal.open && <ShopModal shop={modal.shop} onClose={() => setModal({ open: false })} onDone={done} />}
    </div>
  )
}
