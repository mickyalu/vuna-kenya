import { MMF_ANNUAL_RATE } from './yield.ts'

/** One protocol term. Later deposits join this window. They do not extend it. */
export const LOCK_MONTHS = 12

const DAY_MS = 24 * 60 * 60 * 1000
const YEAR_MS = 365 * DAY_MS

export function addCalendarMonths(from: Date, months: number) {
  const next = new Date(from.getTime())
  const day = next.getUTCDate()
  next.setUTCMonth(next.getUTCMonth() + months)
  if (next.getUTCDate() !== day) next.setUTCDate(0)
  return next
}

export function unlocksAtFrom(occurredAt: string | Date, months = LOCK_MONTHS) {
  const start = typeof occurredAt === 'string' ? new Date(occurredAt) : occurredAt
  return addCalendarMonths(start, months).toISOString()
}

export type LockStamp = { timestamp: string }

export function protocolLock(locks: LockStamp[], now = Date.now()) {
  if (!locks.length) {
    return {
      lockMonths: LOCK_MONTHS,
      daysRemaining: null as number | null,
      unlocksAt: null as string | null,
      started: false,
    }
  }
  const first = locks.reduce((min, lock) => {
    const t = new Date(lock.timestamp).getTime()
    return Number.isFinite(t) ? Math.min(min, t) : min
  }, Number.POSITIVE_INFINITY)
  const unlocksAt = unlocksAtFrom(new Date(first))
  const daysRemaining = Math.max(0, Math.ceil((new Date(unlocksAt).getTime() - now) / DAY_MS))
  return { lockMonths: LOCK_MONTHS, daysRemaining, unlocksAt, started: true }
}

/**
 * Daily compound at the MMF annual rate, on each paid lock from its own timestamp.
 * A lock that just settled earns about zero. The deposit itself is the balance update.
 */
export function accruedYieldKes(
  locks: { amountKes: number; timestamp: string }[],
  now = Date.now(),
  annualRate = MMF_ANNUAL_RATE,
) {
  let total = 0
  for (const lock of locks) {
    const start = new Date(lock.timestamp).getTime()
    if (!Number.isFinite(start) || lock.amountKes <= 0) continue
    const years = Math.max(0, now - start) / YEAR_MS
    total += lock.amountKes * (Math.pow(1 + annualRate, years) - 1)
  }
  return Math.round(total * 10000) / 10000
}

/** One week of 10% annual compound on money saved this week. Not a flat 1.4375%. */
export function weeklyYieldOnSavings(savedKes: number, annualRate = MMF_ANNUAL_RATE) {
  const factor = Math.pow(1 + annualRate, 7 / 365) - 1
  return Math.round(Math.max(0, savedKes) * factor * 100) / 100
}
