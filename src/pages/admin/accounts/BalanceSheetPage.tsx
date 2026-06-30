import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { accountsApi } from '../../../lib/api'

interface AssetItem {
  accountId: number
  accountName: string
  type: string
  balance: number
}

interface WalletItem {
  accountId: number
  accountName: string
  balance: number
}

interface BalanceSheet {
  totalAssets: number
  assets: AssetItem[]
  systemWallets: WalletItem[]
}

function fmt(v: number) {
  return `GH₵ ${Number(v).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`
}

export default function BalanceSheetPage() {
  const { data: sheet, isLoading } = useQuery<BalanceSheet>({
    queryKey: ['balance-sheet'],
    queryFn: () => accountsApi.getBalanceSheet(),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    )
  }
  if (!sheet) return null

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Balance Sheet</h1>
        <p className="text-sm text-slate-500">Business financial position</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total assets</p>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{fmt(sheet.totalAssets)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 pt-4 pb-2 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-900">Assets</p>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Account</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sheet.assets.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-sm text-slate-400">No accounts</td>
              </tr>
            ) : (
              sheet.assets.map((item) => (
                <tr key={item.accountId} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.accountName}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 capitalize">{item.type.replace('_', ' ')}</td>
                  <td className={`px-4 py-3 text-right font-mono font-semibold text-sm ${item.balance >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                    {fmt(item.balance)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {sheet.systemWallets.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 pt-4 pb-2 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900">System Wallets</p>
          </div>
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Account</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sheet.systemWallets.map((item) => (
                <tr key={item.accountId} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.accountName}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-sm text-slate-900">
                    {fmt(item.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
