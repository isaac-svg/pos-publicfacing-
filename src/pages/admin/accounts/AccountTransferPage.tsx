import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Loader2, ArrowLeft } from 'lucide-react'
import { accountsApi } from '../../../lib/api'

interface Account {
  id: number
  name: string
}

export default function AccountTransferPage() {
  const navigate = useNavigate()
  const [fromAccountId, setFromAccountId] = useState('')
  const [toAccountId, setToAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [reference, setReference] = useState('')
  const [error, setError] = useState('')

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ['payment-accounts'],
    queryFn: () => accountsApi.list(),
  })

  const parsedAmount = parseFloat(amount) || 0
  const isValid = fromAccountId && toAccountId && fromAccountId !== toAccountId && parsedAmount > 0 && description.trim()

  const mutation = useMutation({
    mutationFn: () =>
      accountsApi.transfer({
        fromAccountId: parseInt(fromAccountId),
        toAccountId: parseInt(toAccountId),
        amount: parsedAmount,
        description: description.trim(),
        reference: reference || undefined,
      }),
    onSuccess: () => {
      navigate('/admin/accounts')
    },
    onError: () => {
      setError('Transfer failed. Please try again.')
    },
  })

  const inputCls = 'w-full h-9 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring'
  const selectCls = inputCls

  return (
    <div className="max-w-lg space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Transfer between accounts</h1>
          <p className="text-sm text-muted-foreground">Move money from one account to another</p>
        </div>
        <button
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-muted/40"
          onClick={() => navigate('/admin/accounts')}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">{error}</div>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 pt-4 pb-2 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Transfer details</p>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm text-foreground mb-1">From account *</label>
            <select
              className={selectCls}
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
            >
              <option value="">Select source</option>
              {accounts
                .filter((a) => a.id !== parseInt(toAccountId))
                .map((a) => (
                  <option key={a.id} value={String(a.id)}>{a.name}</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-foreground mb-1">To account *</label>
            <select
              className={selectCls}
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
            >
              <option value="">Select destination</option>
              {accounts
                .filter((a) => a.id !== parseInt(fromAccountId))
                .map((a) => (
                  <option key={a.id} value={String(a.id)}>{a.name}</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-foreground mb-1">Amount (GH₵) *</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              className={inputCls}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-foreground mb-1">Description *</label>
            <textarea
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring resize-none"
              rows={3}
              placeholder="Reason for transfer"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-foreground mb-1">Reference</label>
            <input
              className={inputCls}
              placeholder="Optional reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          <button
            className="inline-flex items-center justify-center gap-1.5 h-10 w-full rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            onClick={() => mutation.mutate()}
            disabled={!isValid || mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Complete transfer
          </button>
        </div>
      </div>
    </div>
  )
}
