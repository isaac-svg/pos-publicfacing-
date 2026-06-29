import type { ReceiptPayload } from '../types/print'

export function renderHtmlReceipt(receipt: ReceiptPayload): string {
  const itemRows = receipt.items.map(i => `
    <tr>
      <td>${i.name}</td>
      <td style="text-align:right">x${i.qty}</td>
      <td style="text-align:right">GH₵ ${i.total.toFixed(2)}</td>
    </tr>
  `).join('')

  const taxRows = (receipt.taxes ?? []).map(t => `
    <tr>
      <td colspan="2">${t.name}</td>
      <td style="text-align:right">GH₵ ${t.amount.toFixed(2)}</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @media print { @page { margin: 5mm; } }
    body {
      font-family: monospace;
      font-size: 12px;
      width: 280px;
      margin: 0 auto;
    }
    h2, p { margin: 2px 0; text-align: center; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 2px 0; vertical-align: top; }
    .rule { border-top: 1px dashed #000; margin: 6px 0; }
    .total { font-weight: bold; font-size: 14px; }
  </style>
</head>
<body>
  <h2>${receipt.shopName}</h2>
  <p>${receipt.shopAddress}</p>
  <p>${receipt.shopPhone ?? ''}</p>
  <div class="rule"></div>
  <table>${itemRows}</table>
  <div class="rule"></div>
  <table>
    ${taxRows}
    <tr class="total">
      <td colspan="2">TOTAL</td>
      <td style="text-align:right">GH₵ ${receipt.total.toFixed(2)}</td>
    </tr>
  </table>
  <div class="rule"></div>
  <p>Payment: ${receipt.paymentMethod}</p>
  <p>Cashier: ${receipt.cashier}</p>
  <p>${new Date(receipt.timestamp).toLocaleString()}</p>
  <p>Receipt #: ${receipt.receiptNumber}</p>
</body>
</html>`
}
