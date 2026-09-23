import assert from 'node:assert/strict'
import { test } from 'node:test'
import { cardholderName, isUploadedPhoto, parseProfileDraft, UPLOAD_AVATAR_ID } from './avatars.ts'

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

test('an uploaded photo is accepted and a blank upload is not', () => {
  const photo = `data:image/jpeg;base64,${'a'.repeat(80)}`
  const saved = parseProfileDraft({ firstName: 'Amina', lastInitial: 'K', avatarId: UPLOAD_AVATAR_ID, photo })
  assert.equal(saved.ok, true)
  if (saved.ok) assert.equal(saved.photo, photo)
  const missing = parseProfileDraft({ firstName: 'Amina', lastInitial: 'K', avatarId: UPLOAD_AVATAR_ID, photo: '' })
  assert.equal(missing.ok, false)
  assert.equal(isUploadedPhoto('data:image/svg+xml;base64,aaaa'), false)
})
