const ESC = 0x1B
const GS = 0x1D
const LF = 0x0A

const INIT = [ESC, 0x40]
const BOLD_ON = [ESC, 0x45, 0x01]
const BOLD_OFF = [ESC, 0x45, 0x00]
const CENTER = [ESC, 0x61, 0x01]
const LEFT = [ESC, 0x61, 0x00]
const CUT = [GS, 0x56, 0x00]
const FEED = [ESC, 0x64, 0x03]

const encoder = new TextEncoder()

function text(str: string): number[] {
  return Array.from(encoder.encode(str))
}

function line(str: string): number[] {
  return [...text(str), LF]
}

function dashLine(width = 32): number[] {
  return line('-'.repeat(width))
}

function padRight(s: string, len: number): string {
  return s.length >= len ? s.slice(0, len) : s + ' '.repeat(len - s.length)
}

function padLeft(s: string, len: number): string {
  return s.length >= len ? s.slice(0, len) : ' '.repeat(len - s.length) + s
}

export interface BluetoothReceiptData {
  shopName: string
  shopAddress: string
  shopPhone?: string
  items: { name: string; qty: number; total: number }[]
  subtotal: number
  taxes?: { name: string; amount: number }[]
  total: number
  paymentMethod: string
  cashier: string
  timestamp: string
  receiptNumber: string
}

export function buildReceiptBytes(receipt: BluetoothReceiptData): Uint8Array {
  const cmds: number[] = [
    ...INIT,
    ...CENTER,
    ...BOLD_ON, ...line(receipt.shopName), ...BOLD_OFF,
    ...line(receipt.shopAddress),
    ...(receipt.shopPhone ? line(receipt.shopPhone) : []),
    LF,
    ...LEFT,
    ...dashLine(),
  ]

  for (const item of receipt.items) {
    const name = padRight(item.name.slice(0, 18), 18)
    const qty = padRight(`x${item.qty}`, 6)
    const total = padLeft(item.total.toFixed(2), 8)
    cmds.push(...line(`${name}${qty}${total}`))
  }

  cmds.push(...dashLine())

  if (receipt.taxes) {
    for (const t of receipt.taxes) {
      cmds.push(...line(`${padRight(t.name, 24)}${padLeft(t.amount.toFixed(2), 8)}`))
    }
  }

  cmds.push(
    ...BOLD_ON,
    ...line(`${padRight('TOTAL', 24)}${padLeft(`GH₵${receipt.total.toFixed(2)}`, 8)}`),
    ...BOLD_OFF,
    ...dashLine(),
    ...line(`Payment: ${receipt.paymentMethod}`),
    ...line(`Cashier: ${receipt.cashier}`),
    ...line(new Date(receipt.timestamp).toLocaleString()),
    ...line(`Receipt #: ${receipt.receiptNumber}`),
    LF,
    ...CENTER,
    ...line('Thank you!'),
    ...FEED,
    ...CUT,
  )

  return new Uint8Array(cmds)
}

let pairedDevice: BluetoothDevice | null = null
let cachedCharacteristic: BluetoothRemoteGATTCharacteristic | null = null

const PRINTER_SERVICE = '000018f0-0000-1000-8000-00805f9b34fb'
const PRINTER_CHARACTERISTIC = '00002af1-0000-1000-8000-00805f9b34fb'

export function isWebBluetoothAvailable(): boolean {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator
}

export async function connectBluetoothPrinter(): Promise<void> {
  if (!isWebBluetoothAvailable()) throw new Error('Web Bluetooth not supported')

  const device = await navigator.bluetooth.requestDevice({
    filters: [{ services: [PRINTER_SERVICE] }],
    optionalServices: [PRINTER_SERVICE],
  })

  const server = await device.gatt!.connect()
  const service = await server.getPrimaryService(PRINTER_SERVICE)
  cachedCharacteristic = await service.getCharacteristic(PRINTER_CHARACTERISTIC)
  pairedDevice = device
}

export async function printViaBluetooth(receipt: BluetoothReceiptData): Promise<void> {
  if (!cachedCharacteristic || !pairedDevice?.gatt?.connected) {
    await connectBluetoothPrinter()
  }

  if (!cachedCharacteristic) throw new Error('Printer not connected')

  const data = buildReceiptBytes(receipt)

  // BLE has a 512-byte MTU limit typically — send in chunks
  const CHUNK_SIZE = 512
  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const chunk = data.slice(i, i + CHUNK_SIZE)
    await cachedCharacteristic.writeValueWithoutResponse(chunk)
  }
}
