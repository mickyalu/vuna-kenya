export type HabitEvent = {
  amount_kes: number
  occurred_at: string
  status?: string
}

export type WeeklyStats = {
  total_saved_kes: number
  habits_completed_count: number
  yield_earned_kes: number
  current_streak_days: number
  consistency_pct: number
}

const EAT = 'Africa/Nairobi'
/** Display yield on the wrap card: 1.4375% of verified micro-saves this week. */
const WEEKLY_YIELD_RATE = 0.014375
/** Nairobi has no DST. Midnight EAT is 21:00 UTC the previous calendar day. */
const EAT_OFFSET_MS = 3 * 60 * 60 * 1000

export function eatParts(iso: string | Date) {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: EAT,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const [year, month, day] = fmt.format(d).split('-').map(Number)
  return { year, month, day, key: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` }
}

export function eatMidnightUtc(iso: string | Date) {
  const { year, month, day } = eatParts(iso)
  return new Date(Date.UTC(year, month - 1, day) - EAT_OFFSET_MS)
}

/** Inclusive last 7 calendar days in Africa/Nairobi. */
export function weekWindow(now = new Date()) {
  const start = new Date(eatMidnightUtc(now).getTime() - 6 * 24 * 60 * 60 * 1000)
  return { start, end: now }
}

export function weekRangeLabel(now = new Date()) {
  const { start, end } = weekWindow(now)
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: EAT, month: 'short', day: 'numeric' })
  return `${fmt.format(start)} – ${fmt.format(end)}`
}

function dayKey(iso: string) {
  return eatParts(iso).key
}

function verified(events: HabitEvent[]) {
  return events.filter((e) => !e.status || e.status === 'success' || e.status === 'locked')
}

/**
 * Query helper: last 7 EAT days of verified habit completions.
 * Feed it rows from `habit_events` (or the local ledger mapped to HabitEvent).
 */
export function queryWeeklyMetrics(events: HabitEvent[], now = new Date()): WeeklyStats {
  return computeWeeklyStats(events, now)
}

export function computeWeeklyStats(events: HabitEvent[], now = new Date()): WeeklyStats {
  const { start, end } = weekWindow(now)
  const startMs = start.getTime()
  const endMs = end.getTime()
  const week = verified(events).filter((e) => {
    const t = new Date(e.occurred_at).getTime()
    return t >= startMs && t <= endMs
  })

  const total_saved_kes = week.reduce((sum, e) => sum + Math.max(0, Math.round(e.amount_kes)), 0)
  const habits_completed_count = week.length
  const days = new Set(week.map((e) => dayKey(e.occurred_at)))
  const consistency_pct = Math.min(100, Math.round((days.size / 7) * 100))
  const yield_earned_kes = Math.round(total_saved_kes * WEEKLY_YIELD_RATE * 100) / 100
  const current_streak_days = streakEndingAt(verified(events), now)

  return {
    total_saved_kes,
    habits_completed_count,
    yield_earned_kes,
    current_streak_days,
    consistency_pct,
  }
}

function streakEndingAt(events: HabitEvent[], now: Date) {
  const days = new Set(events.map((e) => dayKey(e.occurred_at)))
  let cursor = eatParts(now)
  let streak = 0
  for (let i = 0; i < 400; i += 1) {
    if (!days.has(cursor.key)) break
    streak += 1
    const prev = new Date(Date.UTC(cursor.year, cursor.month - 1, cursor.day) - 24 * 60 * 60 * 1000)
    cursor = eatParts(prev)
  }
  return streak
}

function padCenter(text: string, width: number) {
  const visible = text.replace(/\*/g, '').length
  const extra = text.length - visible
  const inner = Math.max(width, visible) + extra
  if (text.length >= inner) return text
  const left = Math.floor((inner - text.length) / 2)
  const right = inner - text.length - left
  return `${' '.repeat(left)}${text}${' '.repeat(right)}`
}

function formatKes(n: number) {
  const whole = Number.isInteger(n) ? n.toFixed(0) : n.toFixed(2)
  const [a, b] = whole.split('.')
  const grouped = a.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return b ? `KES ${grouped}.${b}` : `KES ${grouped}`
}

export function weekendNudge(stats: WeeklyStats) {
  if (stats.consistency_pct >= 80) {
    return 'Stay locked in! Keep your discipline steady over the weekend.'
  }
  if (stats.habits_completed_count === 0) {
    return 'No locks this week yet. One whole-shilling STK on Saturday still counts.'
  }
  return 'Protect the streak. One verified habit on Saturday keeps the rail live.'
}

/**
 * WhatsApp scorecard. Box-drawing characters match the in-app weekly card.
 */
export function formatWhatsAppReport(
  userName: string,
  weekRange: string,
  stats: WeeklyStats,
): string {
  const hero = formatKes(stats.total_saved_kes)
  const yieldLine = formatKes(stats.yield_earned_kes)
  const nudge = weekendNudge(stats)
  void userName

  const heroW = 27
  const leftW = 17
  const rightW = 13

  const top = [
    `🟩 *Weekly Report* | ${weekRange}`,
    `*Your Week on VUNA* 🌾`,
    `Here is everything you accomplished with VUNA this week. Numbers are pulled straight from your behavioral dashboard:`,
  ]

  const heroBox = [
    `┌${'─'.repeat(heroW)}┐`,
    `│${padCenter(`*${hero}*`, heroW)}│`,
    `│${padCenter('TOTAL MICRO-SAVED', heroW)}│`,
    `└${'─'.repeat(heroW)}┘`,
  ]

  const grid = [
    `┌${'─'.repeat(leftW)}┬${'─'.repeat(rightW)}┐`,
    `│${padCenter(`*${stats.habits_completed_count}*`, leftW)}│${padCenter(`*${stats.consistency_pct}%*`, rightW)}│`,
    `│${padCenter('HABITS LOGGED', leftW)}│${padCenter('CONSISTENCY', rightW)}│`,
    `├${'─'.repeat(leftW)}┼${'─'.repeat(rightW)}┤`,
    `│${padCenter(`*${yieldLine}*`, leftW)}│${padCenter(`*${stats.current_streak_days}*`, rightW)}│`,
    `│${padCenter('YIELD GAINED', leftW)}│${padCenter('STREAK DAYS', rightW)}│`,
    `└${'─'.repeat(leftW)}┴${'─'.repeat(rightW)}┘`,
  ]

  const foot = [
    `🔥 *Weekend Warning:* ${nudge}`,
    `📱 _Manage notifications in your VUNA Profile settings._`,
  ]

  return [...top, '', ...heroBox, ...grid, ...foot].join('\n')
}
