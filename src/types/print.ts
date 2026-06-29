export interface ReceiptPayload {
  shopName: string
  shopAddress: string
  shopPhone?: string
  items: { name: string; qty: number; unitPrice: number; total: number }[]
  subtotal: number
  taxes?: { name: string; amount: number }[]
  total: number
  paymentMethod: string
  cashier: string
  timestamp: string
  receiptNumber: string
}
