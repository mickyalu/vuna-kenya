import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { normalizeRecipientHandle } from '../src/lib/gift.ts'
import { LOCK_MONTHS, unlocksAtFrom } from '../src/lib/lock-math.ts'
import { maskMsisdn } from '../shared/mask.ts'
import { toMsisdn } from '../shared/phone.ts'
import { listPublic } from './ledger.ts'
import { logError, logInfo } from './log.ts'
import {
  formatWhatsAppReport,
  queryWeeklyMetrics,
  weekRangeLabel,
  type HabitEvent,
} from '../src/lib/reports.ts'

const PREFS = join(process.cwd(), '.data', 'vuna-wrap-prefs.json')

export type WrapRecipient = {
  phone_number: string
  display_name: string
  friday_wrap_enabled: boolean
}

type PrefFile = Record<string, { enabled: boolean; name: string }>

function loadPrefs(): PrefFile {
  try {
    return JSON.parse(readFileSync(PREFS, 'utf8')) as PrefFile
  } catch {
    return {}
  }
}

function savePrefs(data: PrefFile) {
  try {
    mkdirSync(dirname(PREFS), { recursive: true })
    writeFileSync(PREFS, JSON.stringify(data), 'utf8')
  } catch {
    try {
      writeFileSync('/tmp/vuna-wrap-prefs.json', JSON.stringify(data), 'utf8')
    } catch {
      logError('wrap prefs persist skipped')
    }
  }
}

export function setWrapPref(msisdn: string, enabled: boolean, name?: string) {
  const n = toMsisdn(msisdn)
  if (!n) throw new Error('Invalid MSISDN')
  const data = loadPrefs()
  data[n] = { enabled, name: name || data[n]?.name || '' }
  savePrefs(data)
  return { phone_number: n, friday_wrap_enabled: enabled }
}

function supabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

async function supabaseRest<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${process.env.SUPABASE_URL}${path}`
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const res = await fetch(url, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init?.headers ?? {}),
    },
  })
  if (res.status === 409) return [] as T
  if (!res.ok) {
    logError('supabase rest failed')
    throw new Error('Profile store unavailable.')
  }
  if (res.status === 204) return [] as T
  const text = await res.text()
  if (!text) return [] as T
  return JSON.parse(text) as T
}

export async function upsertWrapProfile(msisdn: string, enabled: boolean, name?: string) {
  const local = setWrapPref(msisdn, enabled, name)
  if (!supabaseConfigured()) return { ...local, source: 'local' as const }
  const rows = await supabaseRest<{ id: string }[]>(
    `/rest/v1/profiles?phone_number=eq.${encodeURIComponent(msisdn)}&select=id`,
  )
  if (rows[0]?.id) {
    await supabaseRest(`/rest/v1/profiles?id=eq.${rows[0].id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        friday_wrap_enabled: enabled,
        display_name: name || undefined,
        updated_at: new Date().toISOString(),
      }),
    })
  } else {
    await supabaseRest('/rest/v1/profiles', {
      method: 'POST',
      body: JSON.stringify({
        phone_number: msisdn,
        friday_wrap_enabled: enabled,
        display_name: name || null,
      }),
    })
  }
  return { phone_number: msisdn, friday_wrap_enabled: enabled, source: 'supabase' as const }
}

export type StoredLock = {
  checkoutRequestId: string
  mpesaReceipt: string | null
  amountKes: number
  habitId: string
  pillar: string
  timestamp: string
  lockMonths: number
  unlocksAt: string
}

async function ensureProfileId(msisdn: string) {
  const rows = await supabaseRest<{ id: string }[]>(
    `/rest/v1/profiles?phone_number=eq.${encodeURIComponent(msisdn)}&select=id`,
  )
  if (rows[0]?.id) return rows[0].id
  const created = await supabaseRest<{ id: string }[]>('/rest/v1/profiles', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      phone_number: msisdn,
      friday_wrap_enabled: true,
    }),
  })
  return created[0]?.id ?? null
}

/** Paid locks only. Gifts stay off this table. Later locks keep the first unlock date. */
export async function recordLockEvent(input: {
  msisdn: string
  habitId: string
  pillar: string
  amountKes: number
  checkoutRequestId: string
  mpesaReceipt: string | null
  occurredAt: string
}) {
  const already = await listLocksForPhone(input.msisdn)
  const firstMs = [...already.map((lock) => new Date(lock.timestamp).getTime()), new Date(input.occurredAt).getTime()]
    .filter((t) => Number.isFinite(t))
    .reduce((min, t) => Math.min(min, t), Number.POSITIVE_INFINITY)
  const unlocksAt = unlocksAtFrom(new Date(firstMs))
  if (!supabaseConfigured()) {
    logInfo('lock kept on ledger', maskMsisdn(input.msisdn))
    return { unlocksAt, stored: 'ledger' as const }
  }
  const profileId = await ensureProfileId(input.msisdn)
  if (!profileId) throw new Error('Profile store unavailable.')
  const base = {
    profile_id: profileId,
    habit_id: input.habitId,
    amount_kes: input.amountKes,
    checkout_request_id: input.checkoutRequestId,
    mpesa_receipt: input.mpesaReceipt,
    status: 'success',
    occurred_at: input.occurredAt,
  }
  const full = {
    ...base,
    pillar: input.pillar,
    lock_months: LOCK_MONTHS,
    unlocks_at: unlocksAt,
  }
  try {
    await supabaseRest('/rest/v1/habit_events', {
      method: 'POST',
      headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify(full),
    })
  } catch {
    await supabaseRest('/rest/v1/habit_events', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(base),
    })
    logInfo('lock stored without unlock column — apply 002_lock_periods.sql')
  }
  logInfo('lock stored', maskMsisdn(input.msisdn))
  return { unlocksAt, stored: 'supabase' as const }
}

async function findProfileIdByHandle(handle: string): Promise<string | null> {
  const bare = handle.replace(/^@/, '')
  try {
    const rows = await supabaseRest<{ id: string }[]>(
      `/rest/v1/profiles?or=(handle.eq.${encodeURIComponent(handle)},handle.eq.${encodeURIComponent(bare)})&select=id&limit=1`,
    )
    return rows[0]?.id ?? null
  } catch {
    return null
  }
}

/**
 * Credits the chosen recipient. sender_profile_id is only who paid.
 * This never writes habit_events, so the gift does not become the sender's lock.
 */
export async function recordGiftEvent(input: {
  senderMsisdn: string
  recipientHandle: string
  amountKes: number
  checkoutRequestId: string
  mpesaReceipt: string | null
  occurredAt: string
}) {
  const recipientHandle = normalizeRecipientHandle(input.recipientHandle)
  if (!recipientHandle) throw new Error('Gift needs a recipient.')
  if (!supabaseConfigured()) {
    logInfo('gift kept on ledger', recipientHandle)
    return { stored: 'ledger' as const, recipientHandle, amountKes: input.amountKes }
  }
  const senderProfileId = await ensureProfileId(input.senderMsisdn)
  const recipientProfileId = await findProfileIdByHandle(recipientHandle)
  try {
    await supabaseRest('/rest/v1/gifts', {
      method: 'POST',
      headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify({
        recipient_handle: recipientHandle,
        recipient_profile_id: recipientProfileId,
        sender_profile_id: senderProfileId,
        amount_kes: input.amountKes,
        checkout_request_id: input.checkoutRequestId,
        mpesa_receipt: input.mpesaReceipt,
        status: 'success',
        occurred_at: input.occurredAt,
      }),
    })
  } catch {
    logInfo('gift stored without gifts table — apply 003_gifts.sql', recipientHandle)
    return { stored: 'ledger' as const, recipientHandle, amountKes: input.amountKes }
  }
  logInfo('gift stored', recipientHandle)
  return { stored: 'supabase' as const, recipientHandle, amountKes: input.amountKes }
}

function shareUnlock(locks: StoredLock[]): StoredLock[] {
  if (!locks.length) return locks
  const first = locks.reduce((min, lock) => {
    const t = new Date(lock.timestamp).getTime()
    return Number.isFinite(t) ? Math.min(min, t) : min
  }, Number.POSITIVE_INFINITY)
  const unlocksAt = unlocksAtFrom(new Date(first))
  return locks.map((lock) => ({ ...lock, lockMonths: LOCK_MONTHS, unlocksAt }))
}

export async function listLocksForPhone(msisdn: string): Promise<StoredLock[]> {
  const fromLedger: StoredLock[] = listPublic(500)
    .filter(
      (row) =>
        row.kind === 'lock' &&
        row.status === 'success' &&
        row.msisdnMasked === maskMsisdn(msisdn) &&
        row.unlocksAt,
    )
    .map((row) => ({
      checkoutRequestId: row.checkoutRequestId,
      mpesaReceipt: row.mpesaReceipt,
      amountKes: row.amountKes,
      habitId: row.habitId,
      pillar: row.pillar,
      timestamp: row.timestamp,
      lockMonths: row.lockMonths ?? LOCK_MONTHS,
      unlocksAt: row.unlocksAt || unlocksAtFrom(row.timestamp),
    }))

  if (!supabaseConfigured()) return shareUnlock(fromLedger)

  try {
    const profiles = await supabaseRest<{ id: string }[]>(
      `/rest/v1/profiles?phone_number=eq.${encodeURIComponent(msisdn)}&select=id`,
    )
    const id = profiles[0]?.id
    if (!id) return shareUnlock(fromLedger)
    let rows: {
      habit_id: string
      amount_kes: number
      checkout_request_id: string | null
      mpesa_receipt: string | null
      occurred_at: string
      status: string
      pillar?: string | null
      lock_months?: number | null
      unlocks_at?: string | null
    }[]
    try {
      rows = await supabaseRest(
        `/rest/v1/habit_events?profile_id=eq.${id}&status=eq.success&select=habit_id,amount_kes,checkout_request_id,mpesa_receipt,occurred_at,status,pillar,lock_months,unlocks_at&order=occurred_at.asc&limit=500`,
      )
    } catch {
      rows = await supabaseRest(
        `/rest/v1/habit_events?profile_id=eq.${id}&status=eq.success&select=habit_id,amount_kes,checkout_request_id,mpesa_receipt,occurred_at,status&order=occurred_at.asc&limit=500`,
      )
    }
    const seen = new Set(rows.map((row) => row.checkout_request_id).filter(Boolean))
    const stored = rows.map((row) => ({
      checkoutRequestId: row.checkout_request_id || row.habit_id,
      mpesaReceipt: row.mpesa_receipt,
      amountKes: row.amount_kes,
      habitId: row.habit_id,
      pillar: row.pillar || '',
      timestamp: row.occurred_at,
      lockMonths: row.lock_months || LOCK_MONTHS,
      unlocksAt: row.unlocks_at || unlocksAtFrom(row.occurred_at),
    }))
    for (const lock of fromLedger) {
      if (!seen.has(lock.checkoutRequestId)) stored.push(lock)
    }
    return shareUnlock(stored)
  } catch {
    logError('lock list failed')
    return shareUnlock(fromLedger)
  }
}

export async function listWrapRecipients(): Promise<WrapRecipient[]> {
  if (supabaseConfigured()) {
    const rows = await supabaseRest<WrapRecipient[]>(
      '/rest/v1/profiles?friday_wrap_enabled=eq.true&phone_number=not.is.null&select=phone_number,display_name,friday_wrap_enabled',
    )
    return rows.filter((r) => toMsisdn(r.phone_number))
  }
  return Object.entries(loadPrefs())
    .filter(([, v]) => v.enabled)
    .map(([phone_number, v]) => ({
      phone_number,
      display_name: v.name,
      friday_wrap_enabled: true,
    }))
}

async function eventsForRecipient(phone: string): Promise<HabitEvent[]> {
  const lookback = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
  if (supabaseConfigured()) {
    const profiles = await supabaseRest<{ id: string }[]>(
      `/rest/v1/profiles?phone_number=eq.${encodeURIComponent(phone)}&select=id`,
    )
    const id = profiles[0]?.id
    if (!id) return []
    const rows = await supabaseRest<
      { amount_kes: number; occurred_at: string; status: string }[]
    >(
      `/rest/v1/habit_events?profile_id=eq.${id}&occurred_at=gte.${encodeURIComponent(lookback)}&select=amount_kes,occurred_at,status&limit=2000`,
    )
    return rows
  }
  const masked = maskMsisdn(phone)
  return listPublic(500)
    .filter(
      (row) =>
        row.status === 'success' &&
        row.kind === 'lock' &&
        row.msisdnMasked === masked,
    )
    .map((row) => ({
      amount_kes: row.amountKes,
      occurred_at: row.timestamp,
      status: row.status,
    }))
}

export async function sendWhatsAppText(msisdn: string, text: string) {
  const url = process.env.WHATSAPP_API_URL
  const token = process.env.WHATSAPP_API_TOKEN
  if (!url || !token) {
    logInfo('whatsapp wrap mock', maskMsisdn(msisdn))
    return { mock: true as const }
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: msisdn,
      type: 'text',
      text: { body: text, preview_url: false },
    }),
  })
  if (!res.ok) {
    logError('whatsapp wrap send failed')
    throw new Error('WhatsApp provider rejected the wrap.')
  }
  return { mock: false as const }
}

export async function runFridayWrap() {
  const recipients = await listWrapRecipients()
  const range = weekRangeLabel()
  const results: { masked: string; mock: boolean; ok: boolean }[] = []
  let sample: string | null = null

  for (const person of recipients) {
    const msisdn = toMsisdn(person.phone_number)
    if (!msisdn) continue
    const stats = queryWeeklyMetrics(await eventsForRecipient(msisdn))
    const text = formatWhatsAppReport(person.display_name || 'there', range, stats)
    if (!sample) sample = text
    try {
      const sent = await sendWhatsAppText(msisdn, text)
      results.push({ masked: maskMsisdn(msisdn), mock: sent.mock, ok: true })
    } catch {
      results.push({ masked: maskMsisdn(msisdn), mock: false, ok: false })
    }
  }

  logInfo(`friday wrap sent=${results.filter((r) => r.ok).length}`)
  return {
    ok: true,
    week: range,
    recipients: results.length,
    sent: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    mock: results.every((r) => r.mock) || results.length === 0,
    delivered: results,
    sample,
  }
}

export function cronAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV !== 'production'
  const auth = req.headers.get('authorization') || ''
  const header = req.headers.get('x-cron-secret') || ''
  return auth === `Bearer ${secret}` || header === secret
}
