type Bucket = number[]

const WINDOW_MS = 60_000
const MAX_PUSH_PER_WINDOW = 5
const hits = new Map<string, Bucket>()
const pendingPhones = new Set<string>()
const checkoutOwner = new Map<string, string>()

export function allowStkPush(msisdn: string): string | null {
  const now = Date.now()
  const prev = (hits.get(msisdn) ?? []).filter((t) => now - t < WINDOW_MS)
  if (prev.length >= MAX_PUSH_PER_WINDOW) {
    return 'Too many STK prompts on this number. Wait a minute, then try again.'
  }
  if (pendingPhones.has(msisdn)) {
    return 'An STK prompt is already open on this number. Complete or cancel it on the Safaricom screen first.'
  }
  prev.push(now)
  hits.set(msisdn, prev)
  pendingPhones.add(msisdn)
  return null
}

export function bindCheckout(checkoutRequestId: string, msisdn: string) {
  checkoutOwner.set(checkoutRequestId, msisdn)
}

export function releaseCheckout(checkoutRequestId: string) {
  const msisdn = checkoutOwner.get(checkoutRequestId)
  if (msisdn) {
    pendingPhones.delete(msisdn)
    checkoutOwner.delete(checkoutRequestId)
  }
}

export function clearPendingPush(msisdn: string) {
  pendingPhones.delete(msisdn)
}

export function resetRateLimitForTests() {
  hits.clear()
  pendingPhones.clear()
  checkoutOwner.clear()
}

export const STK_RATE = { WINDOW_MS, MAX_PUSH_PER_WINDOW }
