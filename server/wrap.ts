import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
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
  if (!res.ok) {
    logError('supabase rest failed')
    throw new Error('Profile store unavailable.')
  }
  if (res.status === 204) return [] as T
  return (await res.json()) as T
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
