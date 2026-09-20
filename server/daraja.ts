import { createHash } from 'node:crypto'
import { logError, logInfo } from './log.ts'

type Token = { access: string; exp: number }

let cached: Token | null = null

export function darajaConfigured() {
  return Boolean(
    process.env.DARAJA_CONSUMER_KEY &&
      process.env.DARAJA_CONSUMER_SECRET &&
      process.env.DARAJA_PASSKEY &&
      process.env.DARAJA_SHORTCODE &&
      process.env.VUNA_STK_MOCK !== '1',
  )
}

function baseUrl() {
  return process.env.DARAJA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke'
}

function timestamp() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}

function password(ts: string) {
  const short = process.env.DARAJA_SHORTCODE!
  const passkey = process.env.DARAJA_PASSKEY!
  return Buffer.from(`${short}${passkey}${ts}`).toString('base64')
}

async function token(): Promise<string> {
  if (cached && cached.exp > Date.now() + 30_000) return cached.access
  const key = process.env.DARAJA_CONSUMER_KEY!
  const secret = process.env.DARAJA_CONSUMER_SECRET!
  const auth = Buffer.from(`${key}:${secret}`).toString('base64')
  const res = await fetch(`${baseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  })
  if (!res.ok) {
    logError('daraja oauth failed')
    throw new Error('Safaricom auth failed.')
  }
  const json = (await res.json()) as { access_token?: string; expires_in?: string }
  if (!json.access_token) throw new Error('Safaricom auth failed.')
  const ttl = Number(json.expires_in || 3599) * 1000
  cached = { access: json.access_token, exp: Date.now() + ttl }
  return json.access_token
}

export async function stkPushLive(input: {
  msisdn: string
  amountKes: number
  accountReference: string
  description: string
  callbackUrl: string
}): Promise<{ checkoutRequestID: string; merchantRequestID: string; customerMessage: string }> {
  const ts = timestamp()
  const short = process.env.DARAJA_SHORTCODE!
  const access = await token()
  const res = await fetch(`${baseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      BusinessShortCode: short,
      Password: password(ts),
      Timestamp: ts,
      TransactionType: 'CustomerPayBillOnline',
      Amount: input.amountKes,
      PartyA: input.msisdn,
      PartyB: short,
      PhoneNumber: input.msisdn,
      CallBackURL: input.callbackUrl,
      AccountReference: input.accountReference.slice(0, 12),
      TransactionDesc: input.description.slice(0, 13),
    }),
  })
  const json = (await res.json()) as {
    CheckoutRequestID?: string
    MerchantRequestID?: string
    CustomerMessage?: string
    ResponseCode?: string
    errorMessage?: string
  }
  if (!res.ok || json.ResponseCode !== '0' || !json.CheckoutRequestID) {
    logError('daraja stk push rejected')
    throw new Error(json.errorMessage || 'STK push was rejected.')
  }
  logInfo('daraja stk push accepted')
  return {
    checkoutRequestID: json.CheckoutRequestID,
    merchantRequestID: json.MerchantRequestID || json.CheckoutRequestID,
    customerMessage: json.CustomerMessage || 'STK sent.',
  }
}

export async function stkQueryLive(checkoutRequestID: string): Promise<{
  resultCode: number
  resultDesc: string
} | null> {
  if (!darajaConfigured()) return null
  const ts = timestamp()
  const short = process.env.DARAJA_SHORTCODE!
  const access = await token()
  const res = await fetch(`${baseUrl()}/mpesa/stkpushquery/v1/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      BusinessShortCode: short,
      Password: password(ts),
      Timestamp: ts,
      CheckoutRequestID: checkoutRequestID,
    }),
  })
  if (!res.ok) return null
  const json = (await res.json()) as { ResultCode?: string | number; ResultDesc?: string }
  if (json.ResultCode === undefined) return null
  return {
    resultCode: Number(json.ResultCode),
    resultDesc: json.ResultDesc || '',
  }
}

export function parseCallback(body: unknown): {
  checkoutRequestId: string
  resultCode: number
  resultDesc: string
  mpesaReceipt: string | null
  amountKes: number | null
  phone: string | null
} | null {
  const root = body as {
    Body?: {
      stkCallback?: {
        CheckoutRequestID?: string
        ResultCode?: number | string
        ResultDesc?: string
        CallbackMetadata?: { Item?: { Name: string; Value?: string | number }[] }
      }
    }
  }
  const cb = root?.Body?.stkCallback
  if (!cb?.CheckoutRequestID) return null
  const items = cb.CallbackMetadata?.Item ?? []
  const pick = (name: string) => items.find((i) => i.Name === name)?.Value
  const receipt = pick('MpesaReceiptNumber')
  const amount = pick('Amount')
  const phone = pick('PhoneNumber')
  return {
    checkoutRequestId: cb.CheckoutRequestID,
    resultCode: Number(cb.ResultCode),
    resultDesc: cb.ResultDesc || '',
    mpesaReceipt: receipt != null ? String(receipt) : null,
    amountKes: amount != null ? Math.round(Number(amount)) : null,
    phone: phone != null ? String(phone) : null,
  }
}

export function mockReceipt(checkoutRequestId: string) {
  return `MOCK${createHash('sha256').update(checkoutRequestId).digest('hex').slice(0, 8).toUpperCase()}`
}
