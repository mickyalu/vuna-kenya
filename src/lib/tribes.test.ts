import assert from 'node:assert/strict'
import { test } from 'node:test'
import { PILLAR_VERTICALS, chosenVertical } from './tribes.ts'

test('a typed focus wins over a pillar chip', () => {
  assert.equal(chosenVertical('Morning run', 'Karura loop'), 'Karura loop')
  assert.equal(chosenVertical('Meal prep', '   '), 'Meal prep')
  assert.equal(chosenVertical('', '  '), null)
})

test('fitness and lifestyle offer different focuses', () => {
  assert.equal(PILLAR_VERTICALS.FITNESS.includes('Morning run'), true)
  assert.equal(PILLAR_VERTICALS.LIFESTYLE.includes('Meal prep'), true)
  assert.equal(PILLAR_VERTICALS.LIFESTYLE.includes('Morning run'), false)
})
