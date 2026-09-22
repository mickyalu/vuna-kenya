import assert from 'node:assert/strict'
import { test } from 'node:test'
import { weeklyYieldOnSavings } from '../src/lib/lock-math.ts'
import {
  queryWeeklyMetrics,
  formatWhatsAppReport,
  weekRangeLabel,
} from '../src/lib/reports.ts'
import { cronAuthorized } from './wrap.ts'

test('weekly stats use last 7 days of verified locks', () => {
  const now = new Date('2026-09-20T18:00:00+03:00')
  const stats = queryWeeklyMetrics(
    [
      { amount_kes: 300, occurred_at: '2026-09-14T06:00:00+03:00', status: 'success' },
      { amount_kes: 300, occurred_at: '2026-09-15T06:00:00+03:00', status: 'success' },
      { amount_kes: 300, occurred_at: '2026-09-16T06:00:00+03:00', status: 'success' },
      { amount_kes: 300, occurred_at: '2026-09-17T06:00:00+03:00', status: 'success' },
      { amount_kes: 300, occurred_at: '2026-09-18T06:00:00+03:00', status: 'success' },
      { amount_kes: 300, occurred_at: '2026-09-19T06:00:00+03:00', status: 'success' },
      { amount_kes: 300, occurred_at: '2026-09-20T06:00:00+03:00', status: 'success' },
      { amount_kes: 300, occurred_at: '2026-09-20T08:00:00+03:00', status: 'success' },
      { amount_kes: 999, occurred_at: '2026-09-01T06:00:00+03:00', status: 'success' },
      { amount_kes: 50, occurred_at: '2026-09-19T06:00:00+03:00', status: 'pending' },
    ],
    now,
  )
  assert.equal(stats.habits_completed_count, 8)
  assert.equal(stats.total_saved_kes, 2400)
  assert.equal(stats.consistency_pct, 100)
  assert.equal(stats.yield_earned_kes, weeklyYieldOnSavings(2400))
  assert.ok(stats.yield_earned_kes > 4 && stats.yield_earned_kes < 5)
  assert.equal(stats.current_streak_days, 7)
})

test('WhatsApp wrap matches the scorecard copy', () => {
  const text = formatWhatsAppReport('Michael', 'Sep 14 – Sep 20', {
    total_saved_kes: 2400,
    habits_completed_count: 8,
    yield_earned_kes: 34.5,
    current_streak_days: 4,
    consistency_pct: 100,
  })
  assert.match(text, /Weekly Report/)
  assert.match(text, /Sep 14 – Sep 20/)
  assert.match(text, /Your Week on VUNA/)
  assert.match(text, /KES 2,400/)
  assert.match(text, /TOTAL MICRO-SAVED/)
  assert.match(text, /HABITS LOGGED/)
  assert.match(text, /CONSISTENCY/)
  assert.match(text, /KES 34.50/)
  assert.match(text, /STREAK DAYS/)
  assert.match(text, /Weekend Warning/)
  assert.match(text, /Stay locked in/)
  assert.match(text, /Profile settings/)
  assert.doesNotMatch(text, /2547/)
})

test('week range is the last 7 EAT calendar days', () => {
  const label = weekRangeLabel(new Date('2026-09-20T18:00:00+03:00'))
  assert.equal(label, 'Sep 14 – Sep 20')
})

test('cron rejects missing bearer when CRON_SECRET is set', () => {
  process.env.CRON_SECRET = 'wrap-secret'
  const denied = cronAuthorized(new Request('http://127.0.0.1/api/cron/friday-wrap'))
  const allowed = cronAuthorized(
    new Request('http://127.0.0.1/api/cron/friday-wrap', {
      headers: { authorization: 'Bearer wrap-secret' },
    }),
  )
  assert.equal(denied, false)
  assert.equal(allowed, true)
  delete process.env.CRON_SECRET
})
