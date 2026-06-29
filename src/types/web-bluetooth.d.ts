interface BluetoothDevice {
  gatt: BluetoothRemoteGATTServer | null
}

interface BluetoothRemoteGATTCharacteristic {
  writeValue(value: BufferSource): Promise<void>
  writeValueWithoutResponse(value: BufferSource): Promise<void>
}

interface BluetoothRemoteGATTServer {
  connect(): Promise<BluetoothRemoteGATTServer>
  getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>
  connected: boolean
}

interface BluetoothRemoteGATTService {
  getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>
}

interface Navigator {
  bluetooth: {
    requestDevice(options: {
      filters: Array<{ services: string[] }>
      optionalServices: string[]
    }): Promise<BluetoothDevice>
  }
}
