import { api } from '../lib/api'
import { renderHtmlReceipt } from '../utils/renderHtmlReceipt'
import { isWebBluetoothAvailable, printViaBluetooth } from './bluetooth-printer'
import type { ReceiptPayload } from '../types/print'

export type PrintMethod = 'bridge' | 'web_bluetooth' | 'browser'

export interface PrintResult {
  method: PrintMethod
  success: boolean
  error?: string
}

export interface AvailableMethods {
  bridge: boolean
  webBluetooth: boolean
  browser: boolean
}

export const PrintService = {
  async getAvailableMethods(): Promise<AvailableMethods> {
    let bridgeAvailable = false
    try {
      const res = await api.get('/api/v1/print/status')
      bridgeAvailable = res.data.data.bridgeAvailable
    } catch { /* not available */ }

    return {
      bridge: bridgeAvailable,
      webBluetooth: isWebBluetoothAvailable(),
      browser: true,
    }
  },

  async print(receipt: ReceiptPayload, saleId?: number): Promise<PrintResult> {
    const methods = await this.getAvailableMethods()

    // Path 1 — Print bridge (Electron app connected)
    if (methods.bridge) {
      return this.printViaBridge(receipt, saleId)
    }

    // Path 2 — Web Bluetooth (Chrome/Edge + BLE printer)
    if (methods.webBluetooth) {
      try {
        return await this.printViaBluetooth(receipt)
      } catch {
        // User cancelled pairing or Bluetooth failed — fall through
      }
    }

    // Path 3 — Browser print dialog (universal fallback)
    return this.printViaBrowser(receipt)
  },

  async printViaBridge(receipt: ReceiptPayload, saleId?: number): Promise<PrintResult> {
    try {
      const res = await api.post('/api/v1/print/receipt', { saleId, receipt })
      const { method, jobId } = res.data.data

      if (method === 'browser_fallback' || !jobId) {
        return this.printViaBrowser(receipt)
      }

      for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 1000))
        const statusRes = await api.get(`/api/v1/print/jobs/${jobId}/status`)
        const status = statusRes.data.data.status
        if (status === 'success') return { method: 'bridge', success: true }
        if (status === 'failed') return {
          method: 'bridge', success: false,
          error: statusRes.data.data.errorMessage ?? 'Print failed',
        }
      }

      return { method: 'bridge', success: false, error: 'Print timed out.' }
    } catch {
      return this.printViaBrowser(receipt)
    }
  },

  async printViaBluetooth(receipt: ReceiptPayload): Promise<PrintResult> {
    await printViaBluetooth({
      shopName: receipt.shopName,
      shopAddress: receipt.shopAddress,
      shopPhone: receipt.shopPhone,
      items: receipt.items,
      subtotal: receipt.subtotal,
      taxes: receipt.taxes,
      total: receipt.total,
      paymentMethod: receipt.paymentMethod,
      cashier: receipt.cashier,
      timestamp: receipt.timestamp,
      receiptNumber: receipt.receiptNumber,
    })
    return { method: 'web_bluetooth', success: true }
  },

  printViaBrowser(receipt: ReceiptPayload): PrintResult {
    const html = renderHtmlReceipt(receipt)
    const win = window.open('', '_blank', 'width=400,height=600')
    if (win) {
      win.document.write(html)
      win.document.close()
      win.focus()
      win.print()
    }
    return { method: 'browser', success: true }
  },
}
