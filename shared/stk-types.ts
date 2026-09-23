export type StkKind = 'lock' | 'gift'
export type LedgerStatus = 'pending' | 'success' | 'cancelled' | 'failed'

export type LedgerEntry = {
  timestamp: string
  habitId: string
  activity: string
  pillar: string
  amountKes: number
  msisdnMasked: string
  checkoutRequestId: string
  merchantRequestId: string
  mpesaReceipt: string | null
  resultCode: number | null
  resultDesc: string | null
  status: LedgerStatus
  kind: StkKind
  credited: boolean
  accountReference: string
  /** Set on gifts. This is who receives the money, not the payer. */
  recipientHandle: string | null
}

export type PublicStkStatus = {
  checkoutRequestId: string
  merchantRequestId: string
  habitId: string
  activity: string
  pillar: string
  amountKes: number
  kind: StkKind
  status: LedgerStatus
  resultCode: number | null
  resultDesc: string | null
  mpesaReceipt: string | null
  timestamp: string
  msisdnMasked: string
  recipientHandle?: string | null
  lockMonths?: number
  unlocksAt?: string | null
}

export type StkPushRequest = {
  phone?: string
  amount: number | string
  habitId: string
  activity: string
  pillar: string
  kind: StkKind
  accountReference?: string
  recipientHandle?: string
}

export type StkPushResponse = {
  checkoutRequestID: string
  merchantRequestID: string
  customerMessage: string
  mock: boolean
}
