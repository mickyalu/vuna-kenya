import { createHash, randomBytes } from 'node:crypto'
import { toMsisdn } from '../shared/phone.ts'

const COOKIE = 'vuna_sid'
const sessions = new Map<string, { msisdn: string; createdAt: number }>()
const TTL_MS = 12 * 60 * 60 * 1000

function hashSid(sid: string) {
  return createHash('sha256').update(sid).digest('hex')
}

export function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {}
  if (!header) return out
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=')
    if (!k) continue
    out[k] = decodeURIComponent(rest.join('='))
  }
  return out
}

export function cookieHeader(sid: string, secure: boolean) {
  const parts = [
    `${COOKIE}=${encodeURIComponent(sid)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(TTL_MS / 1000)}`,
  ]
  if (secure) parts.push('Secure')
  return parts.join('; ')
}

export function putMsisdn(msisdn: string): { sid: string } {
  const sid = randomBytes(24).toString('hex')
  sessions.set(hashSid(sid), { msisdn, createdAt: Date.now() })
  return { sid }
}

export function readMsisdn(req: Request): string | null {
  const cookies = parseCookies(req.headers.get('cookie'))
  const headerSid = req.headers.get('x-vuna-session')
  const sid = headerSid || cookies[COOKIE]
  if (!sid) return null
  const row = sessions.get(hashSid(sid))
  if (!row) return null
  if (Date.now() - row.createdAt > TTL_MS) {
    sessions.delete(hashSid(sid))
    return null
  }
  return row.msisdn
}

export function resolveMsisdn(req: Request, bodyPhone?: string): { msisdn: string; sid?: string } | null {
  const fromBody = bodyPhone ? toMsisdn(bodyPhone) : null
  const fromSession = readMsisdn(req)
  const msisdn = fromBody || fromSession
  if (!msisdn) return null
  if (fromBody && fromBody !== fromSession) {
    const { sid } = putMsisdn(fromBody)
    return { msisdn: fromBody, sid }
  }
  return { msisdn }
}

export { COOKIE as SESSION_COOKIE }
