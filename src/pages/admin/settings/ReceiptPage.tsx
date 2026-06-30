import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, ChevronDown } from 'lucide-react'
import { api } from '../../../lib/api'

const inputCls = 'w-full h-9 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring'
const labelCls = 'text-xs font-medium text-muted-foreground'

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      title="Toggle" onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-slate-200'}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-card shadow-sm transition-transform mt-0.5 ml-0.5 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  )
}

function Row({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-sm text-foreground">{label}</span>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-foreground bg-muted/40 hover:bg-muted transition-colors"
      >
        {title}
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-4 py-4 space-y-3 bg-card">{children}</div>}
    </div>
  )
}

interface ReceiptConfig {
  businessName: string | null
  showShopName: boolean; showBranchName: boolean; showAddress: boolean
  phone1: string | null; phone2: string | null; showPhones: boolean
  customAddress: string | null; showEmail: boolean; email: string | null
  showWebsite: boolean; website: string | null; showVatNumber: boolean; vatNumber: string | null
  headerAlignment: 'left' | 'center' | 'right'
  showHeaderDivider: boolean; showInvoiceId: boolean; showDatetime: boolean
  showCashier: boolean; showSubtotal: boolean; showThankYou: boolean
  thankYouMessage: string; showTagline: boolean; tagline: string | null
  showPoweredBy: boolean; poweredByText: string
}

const defaults: ReceiptConfig = {
  businessName: null, showShopName: true, showBranchName: false, showAddress: true,
  phone1: null, phone2: null, showPhones: true, customAddress: null,
  showEmail: false, email: null, showWebsite: false, website: null,
  showVatNumber: false, vatNumber: null, headerAlignment: 'center',
  showHeaderDivider: true, showInvoiceId: true, showDatetime: true,
  showCashier: true, showSubtotal: true, showThankYou: true,
  thankYouMessage: 'Thank you for your purchase!',
  showTagline: false, tagline: null, showPoweredBy: true, poweredByText: 'Powered by Shepherd POS',
}

export default function ReceiptPage() {
  const qc = useQueryClient()
  const [form, setForm] = useState<ReceiptConfig>(defaults)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const { data: config, isLoading } = useQuery<ReceiptConfig>({
    queryKey: ['receipt-config'],
    queryFn: () => api.get('/api/v1/receipt-config').then(r => r.data.data),
  })

  useEffect(() => { if (config) setForm(prev => ({ ...prev, ...config })) }, [config])

  const mutation = useMutation({
    mutationFn: (values: ReceiptConfig) => api.patch('/api/v1/receipt-config', values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['receipt-config'] })
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    },
    onError: (err: unknown) => {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Save failed')
    },
  })

  function set<K extends keyof ReceiptConfig>(k: K, v: ReceiptConfig[K]) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>

  return (
    <form onSubmit={e => { e.preventDefault(); mutation.mutate(form) }} className="space-y-5 max-w-xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Receipt Configuration</h1>
          <p className="text-sm text-muted-foreground">Customise how receipts look across all shops</p>
        </div>
        <button type="submit" disabled={mutation.isPending} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
          {mutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {saved ? 'Saved ✓' : 'Save changes'}
        </button>
      </div>

      {error && <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">{error}</div>}

      <Section title="Header">
        <div className="space-y-1">
          <label className={labelCls}>Business name</label>
          <input value={form.businessName ?? ''} onChange={e => set('businessName', e.target.value || null)} placeholder="Leave blank to use shop name" className={inputCls} />
        </div>
        <Row label="Show shop name" checked={form.showShopName} onChange={v => set('showShopName', v)} />
        <Row label="Show branch name" checked={form.showBranchName} onChange={v => set('showBranchName', v)} />
        <Row label="Show address" checked={form.showAddress} onChange={v => set('showAddress', v)} />
        {form.showAddress && (
          <div className="space-y-1">
            <label className={labelCls}>Custom address (overrides branch address)</label>
            <textarea value={form.customAddress ?? ''} onChange={e => set('customAddress', e.target.value || null)} rows={2} placeholder="No. 5 Ring Road Central, Accra" className={`${inputCls} h-auto py-2`} />
          </div>
        )}
        <Row label="Show phone numbers" checked={form.showPhones} onChange={v => set('showPhones', v)} />
        {form.showPhones && (
          <div className="space-y-2 pl-2">
            <input value={form.phone1 ?? ''} onChange={e => set('phone1', e.target.value || null)} placeholder="Phone 1" className={inputCls} />
            <input value={form.phone2 ?? ''} onChange={e => set('phone2', e.target.value || null)} placeholder="Phone 2 (optional)" className={inputCls} />
          </div>
        )}
        <Row label="Show email" checked={form.showEmail} onChange={v => set('showEmail', v)} />
        {form.showEmail && <input value={form.email ?? ''} onChange={e => set('email', e.target.value || null)} placeholder="info@myshop.com" className={inputCls} />}
        <Row label="Show website" checked={form.showWebsite} onChange={v => set('showWebsite', v)} />
        {form.showWebsite && <input value={form.website ?? ''} onChange={e => set('website', e.target.value || null)} placeholder="www.myshop.com" className={inputCls} />}
        <Row label="Show VAT number" checked={form.showVatNumber} onChange={v => set('showVatNumber', v)} />
        {form.showVatNumber && <input value={form.vatNumber ?? ''} onChange={e => set('vatNumber', e.target.value || null)} placeholder="VAT registration number" className={inputCls} />}
        <div className="space-y-1">
          <label className={labelCls}>Header alignment</label>
          <div className="flex gap-1">
            {(['left', 'center', 'right'] as const).map(a => (
              <button key={a} type="button" onClick={() => set('headerAlignment', a)}
                className={`flex-1 h-9 rounded-lg border text-sm capitalize transition-colors ${form.headerAlignment === a ? 'bg-primary border-indigo-600 text-white' : 'border-border text-muted-foreground hover:bg-muted/40'}`}>
                {a}
              </button>
            ))}
          </div>
        </div>
        <Row label="Show header divider" checked={form.showHeaderDivider} onChange={v => set('showHeaderDivider', v)} />
      </Section>

      <Section title="Transaction details">
        <Row label="Show invoice ID" checked={form.showInvoiceId} onChange={v => set('showInvoiceId', v)} />
        <Row label="Show date & time" checked={form.showDatetime} onChange={v => set('showDatetime', v)} />
        <Row label="Show cashier name" checked={form.showCashier} onChange={v => set('showCashier', v)} />
        <Row label="Show subtotal" checked={form.showSubtotal} onChange={v => set('showSubtotal', v)} />
      </Section>

      <Section title="Footer">
        <Row label="Show thank-you message" checked={form.showThankYou} onChange={v => set('showThankYou', v)} />
        {form.showThankYou && (
          <input value={form.thankYouMessage} onChange={e => set('thankYouMessage', e.target.value)} placeholder="Thank you for your purchase!" className={inputCls} />
        )}
        <Row label="Show tagline" checked={form.showTagline} onChange={v => set('showTagline', v)} />
        {form.showTagline && <input value={form.tagline ?? ''} onChange={e => set('tagline', e.target.value || null)} placeholder="Your tagline here" className={inputCls} />}
        <Row label="Show powered-by" checked={form.showPoweredBy} onChange={v => set('showPoweredBy', v)} />
        {form.showPoweredBy && (
          <input value={form.poweredByText} onChange={e => set('poweredByText', e.target.value)} placeholder="Powered by Shepherd POS" className={inputCls} />
        )}
      </Section>
    </form>
  )
}
