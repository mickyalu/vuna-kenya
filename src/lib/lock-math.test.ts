import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  accruedYieldKes,
  addCalendarMonths,
  protocolLock,
  weeklyYieldOnSavings,
} from './lock-math.ts'

test('one year at 10% yields 10% of the locked principal', () => {
  const start = new Date('2026-01-01T00:00:00Z')
  const end = start.getTime() + 365 * 24 * 60 * 60 * 1000
  assert.equal(
    accruedYieldKes([{ amountKes: 100, timestamp: start.toISOString() }], end),
    10,
  )
})

test('a lock that just settled has not earned yield yet', () => {
  const now = Date.parse('2026-09-22T12:00:00Z')
  assert.equal(accruedYieldKes([{ amountKes: 200, timestamp: new Date(now).toISOString() }], now), 0)
  assert.equal(accruedYieldKes([], now), 0)
})

test('a later deposit does not move the first unlock', () => {
  const first = '2026-01-15T00:00:00.000Z'
  const now = Date.parse('2026-07-01T00:00:00Z')
  const term = protocolLock(
    [{ timestamp: first }, { timestamp: '2026-06-01T00:00:00.000Z' }],
    now,
  )
  assert.equal(term.started, true)
  assert.equal(term.lockMonths, 12)
  assert.equal(term.unlocksAt, addCalendarMonths(new Date(first), 12).toISOString())
  assert.ok((term.daysRemaining ?? 0) > 180)
  assert.equal(protocolLock([], now).started, false)
})

test('weekly wrap yield is one week of 10% annual, not 1.4375% of the save', () => {
  const yieldKes = weeklyYieldOnSavings(2400)
  assert.ok(yieldKes > 4)
  assert.ok(yieldKes < 5)
  assert.notEqual(yieldKes, 34.5)
})
