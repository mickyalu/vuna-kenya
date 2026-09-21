import assert from 'node:assert/strict'
import { test } from 'node:test'
import { cardholderName, parseProfileDraft } from './avatars.ts'

test('cardholder name is First.I', () => {
  assert.equal(cardholderName('amina', 'k'), 'Amina.K')
  assert.equal(cardholderName('  Michael ', 'a'), 'Michael.A')
})

test('profile draft rejects an empty first name', () => {
  const result = parseProfileDraft({ firstName: '   ', lastInitial: 'K', avatarId: 'amina' })
  assert.equal(result.ok, false)
})

test('profile draft accepts a Kenya card photo', () => {
  const result = parseProfileDraft({ firstName: 'Amina', lastInitial: 'k', avatarId: 'amina' })
  assert.equal(result.ok, true)
  if (result.ok) {
    assert.equal(result.cardName, 'Amina.K')
    assert.equal(result.avatarId, 'amina')
  }
})
