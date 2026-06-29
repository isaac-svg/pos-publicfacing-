import { useState, useEffect } from 'react'
import { Loader2, Printer } from 'lucide-react'
import { PrintService, type PrintResult, type AvailableMethods } from '../../services/print.service'
import type { ReceiptPayload } from '../../types/print'

interface PrintButtonProps {
  receipt: ReceiptPayload
  saleId?: number
}

export function PrintButton({ receipt, saleId }: PrintButtonProps) {
  const [printing, setPrinting] = useState(false)
  const [result, setResult] = useState<PrintResult | null>(null)
  const [methods, setMethods] = useState<AvailableMethods | null>(null)

  useEffect(() => {
    PrintService.getAvailableMethods().then(setMethods)
  }, [])

  async function handlePrint() {
    setPrinting(true)
    setResult(null)
    const res = await PrintService.print(receipt, saleId)
    setResult(res)
    setPrinting(false)
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handlePrint}
        disabled={printing}
        className="w-full h-10 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 inline-flex items-center justify-center gap-2"
      >
        {printing ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Printing…</>
        ) : (
          <><Printer className="h-4 w-4" /> Print receipt</>
        )}
      </button>

      {methods && !printing && !result && (
        <p className="text-xs text-gray-400 text-center">
          {methods.bridge
            ? '✓ Shop printer available'
            : methods.webBluetooth
              ? '✓ Bluetooth printer available'
              : 'Will open browser print dialog'}
        </p>
      )}

      {result && (
        <p className={`text-xs text-center ${result.success ? 'text-green-600' : 'text-red-600'}`}>
          {result.success
            ? result.method === 'bridge'
              ? 'Printed on shop printer ✓'
              : result.method === 'web_bluetooth'
                ? 'Printed via Bluetooth ✓'
                : 'Sent to browser print dialog ✓'
            : `Print failed: ${result.error}`}
        </p>
      )}
    </div>
  )
}
