import { assertKesInteger } from '../shared/kes.ts'
import { maskMsisdn } from '../shared/mask.ts'
import type { StkKind, StkPushRequest } from '../shared/stk-types.ts'
import {
  darajaConfigured,
  mockReceipt,
  parseCallback,
  stkPushLive,
  stkQueryLive,
} from './daraja.ts'
import { applyCallback, asPublic, getByCheckout, insertPending, newIds } from './ledger.ts'
import { logError, logInfo, logWarn } from './log.ts'
import { allowStkPush, bindCheckout, clearPendingPush, releaseCheckout } from './rate-limit.ts'
import { cookieHeader, putMsisdn, readMsisdn, resolveMsisdn } from './session.ts'
import { cronAuthorized, runFridayWrap, upsertWrapProfile } from './wrap.ts'

function json(data: unknown, status = 200, extra?: Record<string, string>) {
  const headers = new Headers(extra)
  headers.set('Content-Type', 'application/json')
  headers.set('Cache-Control', 'no-store')
  headers.set('X-Content-Type-Options', 'nosniff')
  return new Response(JSON.stringify(data), { status, headers })
}

function error(message: string, status = 400) {
  return json({ error: message }, status)
}

function callbackUrl(req: Request) {
  if (process.env.DARAJA_CALLBACK_URL) return process.env.DARAJA_CALLBACK_URL
  const url = new URL(req.url)
  const proto = req.headers.get('x-forwarded-proto') || url.protocol.replace(':', '')
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || url.host
  return `${proto}://${host}/api/stk/callback`
}

function mockSettle(checkoutRequestId: string) {
  const raw = Number(process.env.VUNA_STK_MOCK_DELAY_MS ?? 1800)
  const delay = Number.isFinite(raw) ? Math.max(0, raw) : 1800
  const run = () => {
    applyCallback({
      checkoutRequestId,
      resultCode: 0,
      resultDesc: 'Mock callback. Set DARAJA_* to use live Safaricom.',
      mpesaReceipt: mockReceipt(checkoutRequestId),
      amountKes: getByCheckout(checkoutRequestId)?.amountKes ?? null,
    })
    releaseCheckout(checkoutRequestId)
  }
  if (delay === 0) run()
  else setTimeout(run, delay)
}

export async function handleHealth() {
  return json({
    ok: true,
    daraja: darajaConfigured() ? 'live' : 'mock',
    paybill: process.env.DARAJA_SHORTCODE || '400200',
  })
}

export async function handleSession(req: Request) {
  if (req.method === 'GET') {
    const msisdn = readMsisdn(req)
    return json({
      registered: Boolean(msisdn),
      masked: msisdn ? maskMsisdn(msisdn) : null,
    })
  }
  if (req.method !== 'POST') return error('Method not allowed', 405)
  let body: { phone?: string } = {}
  try {
    body = (await req.json()) as { phone?: string }
  } catch {
    return error('Invalid JSON')
  }
  const resolved = resolveMsisdn(req, body.phone)
  if (!resolved) return error('Enter a Safaricom number as 07XXXXXXXX or 2547XXXXXXXX.')
  const { sid } = resolved.sid ? { sid: resolved.sid } : putMsisdn(resolved.msisdn)
  const secure = (req.headers.get('x-forwarded-proto') || 'http') === 'https'
  logInfo('session registered', maskMsisdn(resolved.msisdn))
  return json(
    { registered: true, masked: maskMsisdn(resolved.msisdn) },
    200,
    { 'Set-Cookie': cookieHeader(resolved.sid || sid, secure) },
  )
}

export async function handleStkPush(req: Request) {
  if (req.method !== 'POST') return error('Method not allowed', 405)
  let body: StkPushRequest
  try {
    body = (await req.json()) as StkPushRequest
  } catch {
    return error('Invalid JSON')
  }

  const resolved = resolveMsisdn(req, body.phone)
  if (!resolved) return error('Register a Safaricom MSISDN first.')

  let amountKes: number
  try {
    amountKes = assertKesInteger(body.amount)
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Invalid amount')
  }

  const habitId = String(body.habitId || '').slice(0, 80)
  const activity = String(body.activity || '').trim().slice(0, 80)
  const pillar = String(body.pillar || '').slice(0, 32)
  const kind: StkKind = body.kind === 'gift' ? 'gift' : 'lock'
  if (!habitId || !activity) return error('Habit and activity are required.')

  const ids = newIds()
  const blocked = allowStkPush(resolved.msisdn)
  if (blocked) return error(blocked, 429)

  const accountReference = (body.accountReference || (kind === 'gift' ? 'GIFT' : 'VUNA')).slice(0, 12)
  const live = darajaConfigured()
  let checkoutRequestId = ids.checkoutRequestId
  let merchantRequestId = ids.merchantRequestId
  let customerMessage = 'Enter PIN on the Safaricom prompt. VUNA never sees your PIN.'

  try {
    if (live) {
      const pushed = await stkPushLive({
        msisdn: resolved.msisdn,
        amountKes,
        accountReference,
        description: activity,
        callbackUrl: callbackUrl(req),
      })
      checkoutRequestId = pushed.checkoutRequestID
      merchantRequestId = pushed.merchantRequestID
      customerMessage = pushed.customerMessage
    }
  } catch (err) {
    clearPendingPush(resolved.msisdn)
    return error(err instanceof Error ? err.message : 'STK push failed', 502)
  }

  insertPending({
    habitId,
    activity,
    pillar,
    amountKes,
    msisdnMasked: maskMsisdn(resolved.msisdn),
    checkoutRequestId,
    merchantRequestId,
    kind,
    accountReference,
  })
  bindCheckout(checkoutRequestId, resolved.msisdn)

  const headers: Record<string, string> = {}
  if (resolved.sid) {
    const secure = (req.headers.get('x-forwarded-proto') || 'http') === 'https'
    headers['Set-Cookie'] = cookieHeader(resolved.sid, secure)
  }

  if (!live) mockSettle(checkoutRequestId)

  logInfo(`stk push ${live ? 'live' : 'mock'} ${kind} KES ${amountKes}`)
  return json(
    {
      checkoutRequestID: checkoutRequestId,
      merchantRequestID: merchantRequestId,
      customerMessage,
      mock: !live,
    },
    200,
    headers,
  )
}

export async function handleStkStatus(req: Request) {
  const url = new URL(req.url)
  const id = url.searchParams.get('checkoutRequestID') || url.searchParams.get('id')
  if (!id) return error('checkoutRequestID required')
  const row = getByCheckout(id)
  if (!row) return error('Unknown CheckoutRequestID', 404)

  if (row.status === 'pending' && darajaConfigured()) {
    const queried = await stkQueryLive(id)
    if (queried && queried.resultCode !== 1037) {
      const applied = applyCallback({
        checkoutRequestId: id,
        resultCode: queried.resultCode,
        resultDesc: queried.resultDesc,
        mpesaReceipt: queried.resultCode === 0 ? mockReceipt(id) : null,
        amountKes: row.amountKes,
      })
      if (applied) {
        if (applied.row.status !== 'pending') releaseCheckout(id)
        return json(asPublic(applied.row))
      }
    }
  }

  return json(asPublic(row))
}

export async function handleStkCallback(req: Request) {
  if (req.method !== 'POST') return error('Method not allowed', 405)
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return json({ ResultCode: 1, ResultDesc: 'Invalid JSON' }, 400)
  }
  const parsed = parseCallback(body)
  if (!parsed) {
    logError('callback missing CheckoutRequestID')
    return json({ ResultCode: 1, ResultDesc: 'Malformed callback' }, 400)
  }

  const applied = applyCallback({
    checkoutRequestId: parsed.checkoutRequestId,
    resultCode: parsed.resultCode,
    resultDesc: parsed.resultDesc,
    mpesaReceipt: parsed.mpesaReceipt,
    amountKes: parsed.amountKes,
  })

  if (!applied) {
    logWarn('callback for unknown checkout — ignored')
    return json({ ResultCode: 0, ResultDesc: 'Accepted' })
  }

  if (applied.row.status !== 'pending') releaseCheckout(parsed.checkoutRequestId)

  logInfo(
    `callback ${applied.row.status} firstCredit=${applied.firstCredit} receipt=${applied.row.mpesaReceipt ? 'set' : 'none'}`,
  )
  return json({ ResultCode: 0, ResultDesc: 'Accepted' })
}

export async function handleProfileWrap(req: Request) {
  if (req.method !== 'POST') return error('Method not allowed', 405)
  let body: { enabled?: boolean; name?: string } = {}
  try {
    body = (await req.json()) as { enabled?: boolean; name?: string }
  } catch {
    return error('Invalid JSON')
  }
  if (typeof body.enabled !== 'boolean') return error('enabled must be true or false')
  const resolved = resolveMsisdn(req)
  if (!resolved) return error('Register a Safaricom MSISDN first.', 401)
  const saved = await upsertWrapProfile(resolved.msisdn, body.enabled, body.name)
  logInfo(`friday wrap ${body.enabled ? 'on' : 'off'}`, saved.phone_number)
  const headers: Record<string, string> = {}
  if (resolved.sid) {
    const secure = (req.headers.get('x-forwarded-proto') || 'http') === 'https'
    headers['Set-Cookie'] = cookieHeader(resolved.sid, secure)
  }
  return json(
    { friday_wrap_enabled: saved.friday_wrap_enabled, source: saved.source },
    200,
    headers,
  )
}

export async function handleFridayWrap(req: Request) {
  if (req.method !== 'GET' && req.method !== 'POST') return error('Method not allowed', 405)
  if (!cronAuthorized(req)) return error('Unauthorized', 401)
  const result = await runFridayWrap()
  return json(result)
}

export async function handleApi(req: Request): Promise<Response | null> {
  const path = new URL(req.url).pathname.replace(/\/+$/, '') || '/'
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Cron-Secret, X-Vuna-Session',
        'Access-Control-Allow-Credentials': 'true',
      },
    })
  }
  if (path === '/api/health') return handleHealth()
  if (path === '/api/session') return handleSession(req)
  if (path === '/api/stk/push') return handleStkPush(req)
  if (path === '/api/stk/status') return handleStkStatus(req)
  if (path === '/api/stk/callback') return handleStkCallback(req)
  if (path === '/api/profile/wrap') return handleProfileWrap(req)
  if (path === '/api/cron/friday-wrap') return handleFridayWrap(req)
  return null
}
