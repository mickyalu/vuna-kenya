import assert from 'node:assert/strict'
import { test } from 'node:test'
import { giftAccountReference } from '../src/lib/gift.ts'
import { applyCallback, asPublic, insertPending, newIds, resetLedgerForTests } from './ledger.ts'
import { recordGiftEvent } from './wrap.ts'

test('a paid gift is stored for the chosen profile at the STK amount', async () => {
  resetLedgerForTests()
  const { checkoutRequestId, merchantRequestId } = newIds()
  insertPending({
    habitId: 'gift-post-1',
    activity: 'Vuna Gift @MKUU_ABAN',
    pillar: 'COMMUNITY',
    amountKes: 200,
    msisdnMasked: '2547****5678',
    checkoutRequestId,
    merchantRequestId,
    kind: 'gift',
    accountReference: giftAccountReference('@MKUU_ABAN'),
    recipientHandle: '@MKUU_ABAN',
  })
  const applied = applyCallback({
    checkoutRequestId,
    resultCode: 0,
    resultDesc: 'ok',
    mpesaReceipt: 'GIFT200',
    amountKes: 200,
  })
  assert.equal(applied?.firstCredit, true)
  const view = asPublic(applied!.row)
  assert.equal(view.kind, 'gift')
  assert.equal(view.amountKes, 200)
  assert.equal(view.recipientHandle, '@MKUU_ABAN')
  assert.equal(applied!.row.accountReference, 'MKUUABAN')
  assert.equal(view.unlocksAt, undefined)
  const stored = await recordGiftEvent({
    senderMsisdn: '254712345678',
    recipientHandle: '@MKUU_ABAN',
    amountKes: view.amountKes,
    checkoutRequestId,
    mpesaReceipt: view.mpesaReceipt,
    occurredAt: view.timestamp,
  })
  assert.equal(stored.recipientHandle, '@MKUU_ABAN')
  assert.equal(stored.amountKes, 200)
  assert.equal(stored.stored, 'ledger')
  assert.notEqual(stored.recipientHandle, '254712345678')
})
