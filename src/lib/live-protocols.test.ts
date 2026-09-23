import assert from 'node:assert/strict'
import { test } from 'node:test'
import { liveLockedTotal, liveProtocolRows } from './live-protocols.ts'

const year = 365 * 24 * 60 * 60 * 1000

test('a paid lock ticks forward and an unpaid row stays put', () => {
  const start = '2026-01-01T00:00:00.000Z'
  const now = Date.parse(start) + year
  const rows = liveProtocolRows(
    [
      {
        id: 'lock-1',
        habitId: 'h1',
        name: 'Morning run',
        pillar: 'FITNESS',
        amountKes: 100,
        timestamp: start,
        status: 'locked',
      },
      {
        id: 'draft-1',
        habitId: 'h2',
        name: 'Gym',
        pillar: 'FITNESS',
        amountKes: 50,
        timestamp: null,
        status: 'draft',
      },
    ],
    now,
  )
  assert.equal(rows.length, 2)
  assert.equal(rows[0].name, 'Morning run')
  assert.equal(rows[0].yieldKes, 10)
  assert.equal(rows[0].liveKes, 110)
  assert.equal(rows[1].yieldKes, 0)
  assert.equal(rows[1].liveKes, 50)
  assert.equal(liveLockedTotal(rows), 110)
})

test('an empty roster stays an empty list', () => {
  assert.deepEqual(liveProtocolRows([], Date.now()), [])
  assert.equal(liveLockedTotal([]), 0)
})

test('two locks stay two rows and a fresh lock has not earned yet', () => {
  const now = Date.parse('2026-09-23T08:00:00.000Z')
  const rows = liveProtocolRows(
    [
      {
        id: 'a',
        habitId: 'a',
        name: 'Morning run',
        pillar: 'FITNESS',
        amountKes: 200,
        timestamp: new Date(now).toISOString(),
        status: 'locked',
      },
      {
        id: 'b',
        habitId: 'b',
        name: 'Meal prep',
        pillar: 'LIFESTYLE',
        amountKes: 100,
        timestamp: new Date(now - year).toISOString(),
        status: 'locked',
      },
    ],
    now,
  )
  assert.deepEqual(
    rows.map((row) => row.name),
    ['Morning run', 'Meal prep'],
  )
  assert.equal(rows[0].yieldKes, 0)
  assert.equal(rows[1].yieldKes, 10)
})
