import type { PublicStkStatus, StkKind, StkPushResponse } from '../../shared/stk-types'

async function readJsonSafe<T>(res: Response): Promise<T> {
  const text = await res.text()
  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error('Safaricom gateway returned a non-JSON body.')
  }
}

export async function registerMsisdn(phone: string) {
  const res = await fetch('/api/session', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  })
  const data = await readJsonSafe<{ masked?: string; error?: string }>(res)
  if (!res.ok) throw new Error(data.error || 'Could not register the number.')
  return data.masked ?? null
}

export async function pushStk(input: {
  phone?: string
  amount: number
  habitId: string
  activity: string
  pillar: string
  kind: StkKind
  accountReference?: string
}): Promise<StkPushResponse> {
  const res = await fetch('/api/stk/push', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const data = await readJsonSafe<StkPushResponse & { error?: string }>(res)
  if (!res.ok) throw new Error(data.error || 'STK push failed.')
  return data
}

export type ServerLock = {
  checkoutRequestId: string
  mpesaReceipt: string | null
  amountKes: number
  habitId: string
  pillar: string
  timestamp: string
  lockMonths: number
  unlocksAt: string
}

export async function fetchLocks(): Promise<ServerLock[]> {
  const res = await fetch('/api/locks', { credentials: 'include' })
  if (res.status === 401) return []
  const data = await readJsonSafe<{ locks?: ServerLock[]; error?: string }>(res)
  if (!res.ok) return []
  return data.locks ?? []
}

export async function getStkStatus(checkoutRequestID: string): Promise<PublicStkStatus> {
  const res = await fetch(`/api/stk/status?checkoutRequestID=${encodeURIComponent(checkoutRequestID)}`, {
    credentials: 'include',
  })
  const data = await readJsonSafe<PublicStkStatus & { error?: string }>(res)
  if (!res.ok) throw new Error(data.error || 'Status failed.')
  return data
}

export async function pollStkStatus(
  checkoutRequestID: string,
  onTick: (row: PublicStkStatus) => void,
  opts?: { intervalMs?: number; timeoutMs?: number; signal?: AbortSignal },
): Promise<PublicStkStatus> {
  const intervalMs = opts?.intervalMs ?? 1500
  const timeoutMs = opts?.timeoutMs ?? 90_000
  const started = Date.now()
  let last: PublicStkStatus | null = null
  while (Date.now() - started < timeoutMs) {
    if (opts?.signal?.aborted) throw new Error('Polling stopped.')
    last = await getStkStatus(checkoutRequestID)
    onTick(last)
    if (last.status !== 'pending') return last
    await new Promise((r) => setTimeout(r, intervalMs))
  }
  throw new Error('Timed out waiting for the M-Pesa callback.')
}
