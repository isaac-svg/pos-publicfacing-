import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from '../../../lib/api'

export default function PaymentPage() {
  const qc = useQueryClient()
  const { data: config } = useQuery({ queryKey: ['hubtel'], queryFn: () => settingsApi.hubtel.get() })

  const c = config as { clientIdMasked?: string | null; collectionAccountNumber?: string | null; isConfigured?: boolean } | undefined

  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [accountNo, setAccountNo] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (c) {
      setClientId(c.clientIdMasked ?? '')
      setAccountNo(c.collectionAccountNumber ?? '')
    }
  }, [c])

  const mutation = useMutation({
    mutationFn: () => {
      const d: Record<string, unknown> = {}
      if (clientId && clientId !== '••••••••') d.clientId = clientId
      if (clientSecret) d.clientSecret = clientSecret
      d.collectionAccountNumber = accountNo || null
      return settingsApi.hubtel.update(d)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['hubtel'] }); setSaved(true); setTimeout(() => setSaved(false), 3000) },
  })

  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-2xl font-bold">Payment Settings</h1>
      <p className="text-sm text-muted-foreground">Configure Hubtel credentials for MoMo payment collection.</p>

      <div className="bg-card rounded-lg border border-border p-4 space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Client ID</label>
          <input type="password" value={clientId} onChange={e => setClientId(e.target.value)} className="w-full h-9 rounded-md border border-border px-3 text-sm" placeholder={c?.clientIdMasked ? 'Saved — type to change' : 'Enter Client ID'} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Client Secret</label>
          <input type="password" value={clientSecret} onChange={e => setClientSecret(e.target.value)} className="w-full h-9 rounded-md border border-border px-3 text-sm" placeholder="Enter Client Secret" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Collection Account Number</label>
          <input value={accountNo} onChange={e => setAccountNo(e.target.value)} className="w-full h-9 rounded-md border border-border px-3 text-sm" placeholder="HMxxxxxxxx" />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="h-9 px-4 rounded-md bg-blue-600 text-white text-sm font-medium disabled:opacity-50">
            {mutation.isPending ? 'Saving…' : 'Save'}
          </button>
          {saved && <span className="text-sm text-accent-foreground">Saved</span>}
        </div>
        {c?.isConfigured && <p className="text-xs text-accent-foreground">✓ Hubtel is configured</p>}
      </div>
    </div>
  )
}
