import { registerPlugin } from '@capacitor/core'

export interface SimInfo {
  subscriptionId: number
  slotIndex: number
  carrierName: string | null
  displayName: string | null
  countryIso: string | null
  isEmbedded: boolean
  simIdentityHash: string | null
}

export interface SimStatusResult {
  sims: SimInfo[]
  batteryPercent: number | null
}

export interface GatewayStatusResult {
  isEnabled: boolean
  statusText: string
  pausedReason: string | null
}

export interface SmsGatewayPluginInterface {
  getSimStatus(): Promise<SimStatusResult>
  sendSms(options: { phone: string; message: string; subscriptionId: number }): Promise<{ success: boolean }>
  startGateway(): Promise<{ success: boolean }>
  stopGateway(): Promise<{ success: boolean }>
  getGatewayStatus(): Promise<GatewayStatusResult>
}

const SmsGateway = registerPlugin<SmsGatewayPluginInterface>('SmsGateway')

export { SmsGateway }
