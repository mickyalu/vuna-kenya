import { randomUUID } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { LOCK_MONTHS, unlocksAtFrom } from '../src/lib/lock-math.ts'
import type { LedgerEntry, LedgerStatus, PublicStkStatus, StkKind } from '../shared/stk-types.ts'
import { logError } from './log.ts'

const FILE = join(process.cwd(), '.data', 'vuna-ledger.json')

type Store = {
  byCheckout: Record<string, LedgerEntry>
  receipts: Record<string, string>
}

const mem: Store = { byCheckout: {}, receipts: {} }

function load() {
  try {
    const raw = readFileSync(FILE, 'utf8')
    const parsed = JSON.parse(raw) as Store
    mem.byCheckout = parsed.byCheckout ?? {}
    mem.receipts = parsed.receipts ?? {}
  } catch {
    /* first run or serverless without disk */
  }
}

let loaded = false
function ensure() {
  if (loaded) return
  loaded = true
  load()
}

function persist() {
  try {
    mkdirSync(dirname(FILE), { recursive: true })
    writeFileSync(FILE, JSON.stringify(mem), 'utf8')
  } catch {
    /* Vercel lambda fs may be read-only besides /tmp */
    try {
      writeFileSync('/tmp/vuna-ledger.json', JSON.stringify(mem), 'utf8')
    } catch {
      logError('ledger persist skipped')
    }
  }
}

function protocolUnlock(row: LedgerEntry) {
  if (row.kind !== 'lock') return {}
  const samePayer = Object.values(mem.byCheckout).filter(
    (item) =>
      item.kind === 'lock' &&
      item.credited &&
      item.msisdnMasked === row.msisdnMasked,
  )
  const stamps = samePayer.length ? samePayer : [row]
  const first = stamps.reduce((min, item) => Math.min(min, new Date(item.timestamp).getTime()), Number.POSITIVE_INFINITY)
  return { lockMonths: LOCK_MONTHS, unlocksAt: unlocksAtFrom(new Date(first)) }
}

function publicView(row: LedgerEntry): PublicStkStatus {
  return {
    checkoutRequestId: row.checkoutRequestId,
    merchantRequestId: row.merchantRequestId,
    habitId: row.habitId,
    activity: row.activity,
    pillar: row.pillar,
    amountKes: row.amountKes,
    kind: row.kind,
    status: row.status,
    resultCode: row.resultCode,
    resultDesc: row.resultDesc,
    mpesaReceipt: row.mpesaReceipt,
    timestamp: row.timestamp,
    msisdnMasked: row.msisdnMasked,
    ...protocolUnlock(row),
  }
}

export function newIds() {
  const checkoutRequestId = `ws_CO_${randomUUID().replace(/-/g, '').slice(0, 20)}`
  const merchantRequestId = `ws_M_${randomUUID().replace(/-/g, '').slice(0, 16)}`
  return { checkoutRequestId, merchantRequestId }
}

export function insertPending(input: {
  habitId: string
  activity: string
  pillar: string
  amountKes: number
  msisdnMasked: string
  checkoutRequestId: string
  merchantRequestId: string
  kind: StkKind
  accountReference: string
}): LedgerEntry {
  ensure()
  const row: LedgerEntry = {
    timestamp: new Date().toISOString(),
    habitId: input.habitId,
    activity: input.activity,
    pillar: input.pillar,
    amountKes: input.amountKes,
    msisdnMasked: input.msisdnMasked,
    checkoutRequestId: input.checkoutRequestId,
    merchantRequestId: input.merchantRequestId,
    mpesaReceipt: null,
    resultCode: null,
    resultDesc: null,
    status: 'pending',
    kind: input.kind,
    credited: false,
    accountReference: input.accountReference,
  }
  mem.byCheckout[row.checkoutRequestId] = row
  persist()
  return row
}

export function getByCheckout(id: string): LedgerEntry | null {
  ensure()
  return mem.byCheckout[id] ?? null
}

export function findByReceipt(receipt: string): LedgerEntry | null {
  ensure()
  const id = mem.receipts[receipt]
  return id ? (mem.byCheckout[id] ?? null) : null
}

/**
 * Apply a Safaricom callback once. Repeat deliveries with the same
 * CheckoutRequestID or MpesaReceiptNumber do not credit again.
 */
export function applyCallback(input: {
  checkoutRequestId: string
  resultCode: number
  resultDesc: string
  mpesaReceipt: string | null
  amountKes: number | null
}): { row: LedgerEntry; firstCredit: boolean } | null {
  ensure()
  const row = mem.byCheckout[input.checkoutRequestId]
  if (!row) return null

  if (input.mpesaReceipt) {
    const existing = mem.receipts[input.mpesaReceipt]
    if (existing && existing !== row.checkoutRequestId) {
      return { row: mem.byCheckout[existing]!, firstCredit: false }
    }
  }

  if (row.credited || row.status === 'success') {
    return { row, firstCredit: false }
  }

  let status: LedgerStatus = 'failed'
  if (input.resultCode === 0) status = 'success'
  else if (input.resultCode === 1032) status = 'cancelled'

  if (status === 'success' && input.amountKes != null && input.amountKes !== row.amountKes) {
    row.resultCode = input.resultCode
    row.resultDesc = 'Amount mismatch vs original STK. Not credited.'
    row.status = 'failed'
    persist()
    return { row, firstCredit: false }
  }

  row.resultCode = input.resultCode
  row.resultDesc = input.resultDesc
  row.status = status
  row.mpesaReceipt = input.mpesaReceipt
  const firstCredit = status === 'success' && !row.credited
  if (firstCredit) {
    row.credited = true
    if (input.mpesaReceipt) mem.receipts[input.mpesaReceipt] = row.checkoutRequestId
  }
  persist()
  return { row, firstCredit }
}

export function listPublic(limit = 50): PublicStkStatus[] {
  ensure()
  return Object.values(mem.byCheckout)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit)
    .map(publicView)
}

export function asPublic(row: LedgerEntry): PublicStkStatus {
  return publicView(row)
}

export function resetLedgerForTests() {
  mem.byCheckout = {}
  mem.receipts = {}
  loaded = true
}
