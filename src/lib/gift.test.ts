import assert from 'node:assert/strict'
import { test } from 'node:test'
import { giftAccountReference, normalizeRecipientHandle } from './gift.ts'

test('a gift handle keeps the @ and rejects a blank recipient', () => {
  assert.equal(normalizeRecipientHandle('@MKUU_ABAN'), '@MKUU_ABAN')
  assert.equal(normalizeRecipientHandle('  mkuu_aban '), '@mkuu_aban')
  assert.equal(normalizeRecipientHandle(''), null)
  assert.equal(normalizeRecipientHandle('@'), null)
  assert.equal(normalizeRecipientHandle('@a'), null)
})

test('the paybill account is the recipient, capped at 12 characters', () => {
  assert.equal(giftAccountReference('@MKUU_ABAN'), 'MKUUABAN')
  assert.equal(giftAccountReference('@VeryLongHandleName'), 'VERYLONGHAND')
  assert.equal(giftAccountReference('@MKUU_ABAN').includes('GIFT'), false)
})
