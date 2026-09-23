import { accruedYieldKes } from './lock-math.ts'
import { PILLAR_CATALOG, type PillarId } from './pillars.ts'

export type LiveProtocolStatus = 'locked' | 'draft' | 'pending'

export type LiveProtocolInput = {
  id: string
  habitId: string
  name: string
  pillar: string
  amountKes: number
  timestamp: string | null
  status: LiveProtocolStatus
}

export type LiveProtocolRow = LiveProtocolInput & {
  yieldKes: number
  liveKes: number
}

export function pillarName(pillar: string) {
  if (pillar in PILLAR_CATALOG) return PILLAR_CATALOG[pillar as PillarId].label
  return pillar.trim() || 'Locked habit'
}

/** Each paid lock earns on its own clock. Unpaid rows stay at the amount typed. */
export function liveProtocolRows(items: LiveProtocolInput[], now = Date.now()): LiveProtocolRow[] {
  return items.map((item) => {
    const yieldKes =
      item.status === 'locked' && item.timestamp
        ? accruedYieldKes([{ amountKes: item.amountKes, timestamp: item.timestamp }], now)
        : 0
    return {
      ...item,
      yieldKes,
      liveKes: Math.round((item.amountKes + yieldKes) * 10000) / 10000,
    }
  })
}

export function liveLockedTotal(rows: LiveProtocolRow[]) {
  const total = rows.filter((row) => row.status === 'locked').reduce((sum, row) => sum + row.liveKes, 0)
  return Math.round(total * 10000) / 10000
}
