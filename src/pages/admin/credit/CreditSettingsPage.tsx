import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { creditApi } from '../../../lib/api'

export default function CreditSettingsPage() {
  const qc = useQueryClient()
  const { data: policy } = useQuery({ queryKey: ['credit-policy'], queryFn: () => creditApi.policy.get() })

  const p = policy as { maxCreditAmount?: string; maxCreditDurationDays?: number; defaultFeeType?: string; defaultFeeValue?: string; minDownPaymentPercent?: string; overdueGraceDays?: number; allowPartialPayments?: boolean } | undefined

  const [maxAmt, setMaxAmt] = useState('')
  const [maxDays, setMaxDays] = useState('')
  const [feeType, setFeeType] = useState('percentage')
  const [feeVal, setFeeVal] = useState('')
  const [minDown, setMinDown] = useState('')
  const [grace, setGrace] = useState('')

  useEffect(() => {
    if (!p) return
    setMaxAmt(String(p.maxCreditAmount ?? ''))
    setMaxDays(String(p.maxCreditDurationDays ?? ''))
    setFeeType(p.defaultFeeType ?? 'percentage')
    setFeeVal(String(p.defaultFeeValue ?? ''))
    setMinDown(String(p.minDownPaymentPercent ?? ''))
    setGrace(String(p.overdueGraceDays ?? ''))
  }, [p])

  const mutation = useMutation({
    mutationFn: () => creditApi.policy.update({
      maxCreditAmount: parseFloat(maxAmt) || undefined,
      maxCreditDurationDays: parseInt(maxDays) || undefined,
      defaultFeeType: feeType,
      defaultFeeValue: parseFloat(feeVal) || undefined,
      minDownPaymentPercent: parseFloat(minDown) || undefined,
      overdueGraceDays: parseInt(grace) || undefined,
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['credit-policy'] }),
  })

  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-2xl font-bold">Credit Policy</h1>
      <div className="bg-card rounded-lg border p-4 space-y-3">
        {([['Max credit amount (GH₵)', maxAmt, setMaxAmt], ['Max duration (days)', maxDays, setMaxDays], ['Fee value', feeVal, setFeeVal], ['Min down payment (%)', minDown, setMinDown], ['Grace days', grace, setGrace]] as [string, string, (v: string) => void][]).map(([label, val, setter]) => (
          <div key={label} className="space-y-1">
            <label className="text-sm font-medium">{label}</label>
            <input type="number" value={val} onChange={e => setter(e.target.value)} className="w-full h-9 rounded-md border px-3 text-sm" />
          </div>
        ))}
        <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="h-9 px-4 rounded-md bg-blue-600 text-white text-sm font-medium disabled:opacity-50">
          {mutation.isPending ? 'Saving…' : 'Save policy'}
        </button>
      </div>
    </div>
  )
}
