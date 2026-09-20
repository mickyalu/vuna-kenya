import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { toKesInteger } from '../shared/kes.ts'
import { maskInText, maskMsisdn } from '../shared/mask.ts'
import { toMsisdn } from '../shared/phone.ts'
import { applyCallback, insertPending, newIds, resetLedgerForTests } from './ledger.ts'
import { handleStkCallback, handleStkPush, handleStkStatus } from './handlers.ts'
import { resetRateLimitForTests } from './rate-limit.ts'

afterEach(() => {
  resetLedgerForTests()
  resetRateLimitForTests()
})

test('MSISDN sanitizes to 2547XXXXXXXX', () => {
  assert.equal(toMsisdn('0790123456'), '254790123456')
  assert.equal(toMsisdn('+254790123456'), '254790123456')
  assert.equal(toMsisdn('254790123456'), '254790123456')
  assert.equal(toMsisdn('790123456'), '254790123456')
  assert.equal(toMsisdn('254 790 123 456'), '254790123456')
  assert.equal(toMsisdn('020123456'), null)
})

test('KES sent to Daraja is a whole shilling', () => {
  assert.equal(toKesInteger('10.40'), 10)
  assert.equal(toKesInteger('10.50'), 11)
  assert.equal(toKesInteger(20), 20)
  assert.equal(toKesInteger('0.2'), 0)
})

test('PII mask never echoes the raw MSISDN', () => {
  assert.equal(maskMsisdn('254790123456'), '2547****3456')
  assert.equal(maskInText('prompt 254790123456 PIN 1234'), 'prompt 2547****3456 PIN 1234')
  assert.doesNotMatch(maskInText('07 90123456 paid'), /0790123456/)
})

test('callback is idempotent on CheckoutRequestID and receipt', () => {
  const { checkoutRequestId, merchantRequestId } = newIds()
  insertPending({
    habitId: 'h1',
    activity: 'Morning Run',
    pillar: 'FITNESS',
    amountKes: 20,
    msisdnMasked: '2547****3456',
    checkoutRequestId,
    merchantRequestId,
    kind: 'lock',
    accountReference: 'VUNA',
  })
  const first = applyCallback({
    checkoutRequestId,
    resultCode: 0,
    resultDesc: 'Success',
    mpesaReceipt: 'QJX123',
    amountKes: 20,
  })
  const second = applyCallback({
    checkoutRequestId,
    resultCode: 0,
    resultDesc: 'Success',
    mpesaReceipt: 'QJX123',
    amountKes: 20,
  })
  assert.equal(first?.firstCredit, true)
  assert.equal(second?.firstCredit, false)
  assert.equal(first?.row.credited, true)
})

test('amount mismatch is not credited', () => {
  const { checkoutRequestId, merchantRequestId } = newIds()
  insertPending({
    habitId: 'h1',
    activity: 'Morning Run',
    pillar: 'FITNESS',
    amountKes: 20,
    msisdnMasked: '2547****3456',
    checkoutRequestId,
    merchantRequestId,
    kind: 'lock',
    accountReference: 'VUNA',
  })
  const applied = applyCallback({
    checkoutRequestId,
    resultCode: 0,
    resultDesc: 'Success',
    mpesaReceipt: 'QJX999',
    amountKes: 50,
  })
  assert.equal(applied?.firstCredit, false)
  assert.equal(applied?.row.status, 'failed')
  assert.equal(applied?.row.credited, false)
})

test('HTTP STK loop credits only after callback', async () => {
  process.env.VUNA_STK_MOCK_DELAY_MS = '0'
  process.env.VUNA_STK_MOCK = '1'
  const push = await handleStkPush(
    new Request('http://127.0.0.1/api/stk/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '0790123456',
        amount: 10.4,
        habitId: 'habit-1',
        activity: 'Morning Run',
        pillar: 'FITNESS',
        kind: 'lock',
      }),
    }),
  )
  const pushed = (await push.json()) as { checkoutRequestID: string; mock: boolean }
  assert.equal(push.status, 200)
  assert.equal(pushed.mock, true)

  const pending = await handleStkStatus(
    new Request(`http://127.0.0.1/api/stk/status?checkoutRequestID=${pushed.checkoutRequestID}`),
  )
  const row = (await pending.json()) as { status: string; amountKes: number; mpesaReceipt: string | null }
  assert.equal(row.status, 'success')
  assert.equal(row.amountKes, 10)
  assert.ok(row.mpesaReceipt)

  const replay = await handleStkCallback(
    new Request('http://127.0.0.1/api/stk/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Body: {
          stkCallback: {
            CheckoutRequestID: pushed.checkoutRequestID,
            ResultCode: 0,
            ResultDesc: 'The service request is processed successfully.',
            CallbackMetadata: {
              Item: [
                { Name: 'Amount', Value: 10 },
                { Name: 'MpesaReceiptNumber', Value: row.mpesaReceipt },
              ],
            },
          },
        },
      }),
    }),
  )
  assert.equal(replay.status, 200)
})
