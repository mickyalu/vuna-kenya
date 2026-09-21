import assert from 'node:assert/strict'
import { test } from 'node:test'
import { projectHabitYield } from './yield.ts'

test('annual micro-saved is deposit × days × 52', () => {
  const p = projectHabitYield(100, 3)
  assert.equal(p.weeklyKes, 300)
  assert.equal(p.annualSavedKes, 15600)
  assert.ok(p.harvestKes > p.annualSavedKes)
  assert.equal(p.yieldKes, Math.round((p.harvestKes - p.annualSavedKes) * 100) / 100)
})

test('seven locks a week compounds more than one', () => {
  const low = projectHabitYield(200, 1)
  const high = projectHabitYield(200, 7)
  assert.ok(high.harvestKes > low.harvestKes)
  assert.equal(high.annualSavedKes, 200 * 7 * 52)
})
