import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, ArrowLeft, Wand2 } from 'lucide-react'
import { productsApi, categoriesApi } from '../../../lib/api'

const inputCls = 'w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring'
const labelCls = 'text-xs font-medium text-muted-foreground'

const ITEM_TYPES = [
  { value: 'retail',  label: 'Retail',   desc: 'Physical goods with inventory' },
  { value: 'menu',    label: 'Menu',      desc: 'Food & drinks with optional modifiers' },
  { value: 'service', label: 'Service',   desc: 'No stock tracking' },
  { value: 'bundle',  label: 'Bundle',    desc: 'Group of existing products' },
]

const UNITS = ['pcs', 'kg', 'g', 'litre', 'ml', 'pack', 'box', 'bag', 'pair', 'dozen']

interface FormState {
  name: string; sku: string; itemType: string; description: string
  categoryId: string; unitOfMeasure: string; unitPrice: string
  costPrice: string; wholesaleQty: string; trackInventory: boolean
  expirationDate: string
}

const empty: FormState = {
  name: '', sku: '', itemType: 'retail', description: '',
  categoryId: '', unitOfMeasure: 'pcs', unitPrice: '',
  costPrice: '', wholesaleQty: '0', trackInventory: true,
  expirationDate: '',
}

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [form, setForm] = useState<FormState>(empty)
  const [error, setError] = useState('')
  const [generatingSku, setGeneratingSku] = useState(false)

  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.get(Number(id)),
    enabled: isEdit,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  })

  useEffect(() => {
    if (!product) return
    const p = product as { name: string; sku: string; itemType: string; description: string | null; categoryId: number | null; unitOfMeasure: string; unitPrice: number; costPrice: number | null; wholesaleQty: number; trackInventory: boolean; expirationDate: string | null }
    setForm({
      name: p.name,
      sku: p.sku,
      itemType: p.itemType,
      description: p.description ?? '',
      categoryId: p.categoryId ? String(p.categoryId) : '',
      unitOfMeasure: p.unitOfMeasure,
      unitPrice: String(p.unitPrice),
      costPrice: p.costPrice != null ? String(p.costPrice) : '',
      wholesaleQty: String(p.wholesaleQty),
      trackInventory: p.trackInventory,
      expirationDate: p.expirationDate ? p.expirationDate.slice(0, 10) : '',
    })
  }, [product])

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      isEdit ? productsApi.update(Number(id), data) : productsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      navigate('/products')
    },
    onError: (err: unknown) => {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Failed to save product')
    },
  })

  async function generateSku() {
    setGeneratingSku(true)
    try {
      const res = await productsApi.generateSku(form.itemType)
      const sku = (res as { sku: string })?.sku ?? ''
      setForm(f => ({ ...f, sku }))
    } catch { /* ignore */ } finally { setGeneratingSku(false) }
  }

  function set(k: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.sku.trim() || !form.unitPrice) {
      setError('Name, SKU, and price are required')
      return
    }
    mutation.mutate({
      name: form.name.trim(),
      sku: form.sku.trim().toUpperCase(),
      itemType: form.itemType,
      description: form.description.trim() || null,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      unitOfMeasure: form.unitOfMeasure,
      unitPrice: Number(form.unitPrice),
      costPrice: form.costPrice ? Number(form.costPrice) : null,
      wholesaleQty: Number(form.wholesaleQty) || 0,
      trackInventory: form.trackInventory,
      expirationDate: form.expirationDate || null,
    })
  }

  if (isEdit && loadingProduct) {
    return <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link to="/products" className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Back to products">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold text-foreground">{isEdit ? 'Edit product' : 'Add new item'}</h1>
      </div>

      {error && <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">{error}</div>}

      {/* Item type */}
      <div className="space-y-2">
        <label className={labelCls}>Item type *</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ITEM_TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => setForm(f => ({ ...f, itemType: t.value }))}
              className={`p-3 rounded-lg border text-left transition-colors ${
                form.itemType === t.value
                  ? 'border-secondary bg-secondary/10 text-foreground'
                  : 'border-border bg-background text-muted-foreground hover:border-secondary/50'
              }`}
            >
              <p className="text-xs font-semibold">{t.label}</p>
              <p className="text-[10px] mt-0.5 leading-tight">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Core fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5 sm:col-span-2">
          <label className={labelCls}>Product name *</label>
          <input value={form.name} onChange={set('name')} required placeholder="e.g. Indomie Noodles 70g" className={inputCls} />
        </div>

        <div className="space-y-1.5">
          <label className={labelCls}>SKU *</label>
          <div className="flex gap-2">
            <input
              value={form.sku}
              onChange={set('sku')}
              required
              placeholder="e.g. INDOM-70G"
              className={`${inputCls} flex-1 font-mono uppercase`}
            />
            <button
              type="button"
              title="Auto-generate SKU"
              onClick={generateSku}
              disabled={generatingSku}
              className="h-9 px-3 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              {generatingSku ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">Uppercase letters, numbers and hyphens only</p>
        </div>

        <div className="space-y-1.5">
          <label className={labelCls}>Category</label>
          <select value={form.categoryId} onChange={set('categoryId')} className={inputCls}>
            <option value="">No category</option>
            {(categories as { id: number; name: string }[]).map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className={labelCls}>Selling price (GH₵) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.unitPrice}
            onChange={set('unitPrice')}
            required
            placeholder="0.00"
            className={inputCls}
          />
        </div>

        <div className="space-y-1.5">
          <label className={labelCls}>Cost price (GH₵)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.costPrice}
            onChange={set('costPrice')}
            placeholder="0.00"
            className={inputCls}
          />
        </div>

        <div className="space-y-1.5">
          <label className={labelCls}>Unit of measure</label>
          <div className="flex gap-2">
            <select value={form.unitOfMeasure} onChange={set('unitOfMeasure')} className={`${inputCls} flex-1`}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <input
              value={!UNITS.includes(form.unitOfMeasure) ? form.unitOfMeasure : ''}
              onChange={e => setForm(f => ({ ...f, unitOfMeasure: e.target.value || 'pcs' }))}
              placeholder="Custom..."
              className={`${inputCls} w-28`}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className={labelCls}>Wholesale quantity threshold</label>
          <input
            type="number"
            min="0"
            step="1"
            value={form.wholesaleQty}
            onChange={set('wholesaleQty')}
            placeholder="0"
            className={inputCls}
          />
          <p className="text-[11px] text-muted-foreground">Min qty to get wholesale pricing</p>
        </div>

        {form.itemType !== 'service' && (
          <div className="space-y-1.5">
            <label className={labelCls}>Expiration date</label>
            <input
              type="date"
              value={form.expirationDate}
              onChange={set('expirationDate')}
              className={inputCls}
            />
          </div>
        )}

        <div className="space-y-1.5 sm:col-span-2">
          <label className={labelCls}>Description</label>
          <textarea
            value={form.description}
            onChange={set('description')}
            rows={3}
            placeholder="Optional product description..."
            className={`${inputCls} h-auto py-2 resize-none`}
          />
        </div>
      </div>

      {/* Track inventory toggle */}
      {form.itemType !== 'service' && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30">
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, trackInventory: !f.trackInventory }))}
            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${form.trackInventory ? 'bg-primary' : 'bg-muted-foreground/30'}`}
          >
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ml-0.5 ${form.trackInventory ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
          <div>
            <p className="text-sm font-medium text-foreground">Track inventory</p>
            <p className="text-xs text-muted-foreground">Monitor stock levels and get low stock alerts</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link to="/products" className="flex-1 h-10 rounded-lg border border-border text-sm font-medium text-foreground flex items-center justify-center hover:bg-muted/40 transition-colors">
          Cancel
        </Link>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? 'Save changes' : 'Add product'}
        </button>
      </div>
    </form>
  )
}
