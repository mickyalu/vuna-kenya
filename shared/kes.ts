/** Daraja Amount is a whole shilling. Never send cents. */

export const KES_STK_MIN = 1
export const KES_STK_MAX = 150_000

export function toKesInteger(raw: number | string): number {
  const n = typeof raw === 'number' ? raw : Number.parseFloat(String(raw).replace(/[^\d.]/g, ''))
  if (!Number.isFinite(n) || n <= 0) return 0
  return Math.round(n)
}

export function assertKesInteger(raw: number | string): number {
  const kes = toKesInteger(raw)
  if (kes < KES_STK_MIN) {
    throw new Error('M-Pesa takes whole shillings. Enter at least KES 1.')
  }
  if (kes > KES_STK_MAX) {
    throw new Error(`Amount exceeds the KES ${KES_STK_MAX.toLocaleString('en-KE')} STK cap.`)
  }
  return kes
}
