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
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (!sheet) return null

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Balance Sheet</h1>
        <p className="text-sm text-muted-foreground">Business financial position</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Total assets</p>
          <p className="text-2xl font-bold font-mono text-foreground mt-1">{fmt(sheet.totalAssets)}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 pt-4 pb-2 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Assets</p>
        </div>
        <table className="w-full">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sheet.assets.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-sm text-muted-foreground">No accounts</td>
              </tr>
            ) : (
              sheet.assets.map((item) => (
                <tr key={item.accountId} className="hover:bg-muted/40">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{item.accountName}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{item.type.replace('_', ' ')}</td>
                  <td className={`px-4 py-3 text-right font-mono font-semibold text-sm ${item.balance >= 0 ? 'text-foreground' : 'text-destructive'}`}>
                    {fmt(item.balance)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {sheet.systemWallets.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-5 pt-4 pb-2 border-b border-border">
            <p className="text-sm font-semibold text-foreground">System Wallets</p>
          </div>
          <table className="w-full">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sheet.systemWallets.map((item) => (
                <tr key={item.accountId} className="hover:bg-muted/40">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{item.accountName}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-sm text-foreground">
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
