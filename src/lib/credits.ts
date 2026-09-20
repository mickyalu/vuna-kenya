import type { PublicStkStatus, StkKind } from '../../shared/stk-types'
import { readJson, removeStore, writeJson } from './storage'

export type PendingStk = {
  checkoutRequestId: string
  kind: StkKind
  habitId: string
  activity: string
  pillar: string
  amountKes: number
  postToPulse?: boolean
  caption?: string
  visibility?: 'public' | 'friends'
  giftTo?: string
  giftPostId?: string
  startedAt: string
}

const KEY = 'vuna-pending-stk'
const CREDITS = 'vuna-credits'

export type CreditRow = {
  checkoutRequestId: string
  mpesaReceipt: string | null
  amountKes: number
  kind: StkKind
  habitId: string
  pillar: string
  timestamp: string
}

export function loadPendingStk(): PendingStk | null {
  return readJson<PendingStk | null>(KEY, null)
}

export function savePendingStk(row: PendingStk) {
  writeJson(KEY, row)
}

export function clearPendingStk() {
  removeStore(KEY)
}

export function loadCredits(): CreditRow[] {
  return readJson<CreditRow[]>(CREDITS, [])
}

export function rememberCredit(status: PublicStkStatus): { added: boolean; credits: CreditRow[] } {
  const credits = loadCredits()
  if (credits.some((c) => c.checkoutRequestId === status.checkoutRequestId)) {
    return { added: false, credits }
  }
  if (status.mpesaReceipt && credits.some((c) => c.mpesaReceipt === status.mpesaReceipt)) {
    return { added: false, credits }
  }
  const next = [
    {
      checkoutRequestId: status.checkoutRequestId,
      mpesaReceipt: status.mpesaReceipt,
      amountKes: status.amountKes,
      kind: status.kind,
      habitId: status.habitId,
      pillar: status.pillar,
      timestamp: status.timestamp,
    },
    ...credits,
  ]
  writeJson(CREDITS, next)
  return { added: true, credits: next }
}

export function lockKesFromCredits(credits: CreditRow[]) {
  return credits.filter((c) => c.kind === 'lock').reduce((sum, c) => sum + c.amountKes, 0)
}
