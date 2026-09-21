export const TERMS_TITLE = 'Terms of use'
export const OPT_OUT_TITLE = 'Opt out'
export const CONTACT_TITLE = 'Contact us'

export const TERMS_BODY = [
  'VUNA is a Kenya-first habit lock. You commit whole-shilling KES against habits over M-Pesa STK Push (Daraja Express). Consumer Key, Consumer Secret, and Passkey live only on the server. This device never sees them.',
  'Goal and yield balances move only after the Safaricom callback (ResultCode 0) for a CheckoutRequestID we issued. A cancelled prompt (1032) or a retried callback does not double-credit. Replay is keyed on CheckoutRequestID and MpesaReceiptNumber.',
  'Protocol lock is not a bank deposit, a savings product, or investment advice. Yield on the card is a display of confirmed consistency, not a promise of return.',
  'Vuna Gifts (KES 10, 20, 50) are not protocol locks. STK pays VUNA paybill 400200. We credit the recipient’s gift wallet only after the paybill callback.',
  'Phone numbers are stored as 254XXXXXXXXX on the server session (HttpOnly cookie) and as 2547****1234 on this device. We do not log raw MSISDNs or PINs. The PIN is entered on the Safaricom prompt only.',
  'Tribes are clubs. Join, leave, or create one. An invite link is how friends sit with you. Do not share a link with people you do not want in the circle.',
  'You control Friday 18:00 wrap and in-app notices on Profile. Opt out any time. Erasing this device deletes local VUNA data on this phone only and does not reverse M-Pesa.',
  'By using VUNA you agree to these terms. Nairobi, Kenya. Questions: hello@vuna.app. Built for CMA Regulatory Sandbox evaluation.',
]

export const CONTACT_LINES = [
  { label: 'Email', value: 'hello@vuna.app', href: 'mailto:hello@vuna.app' },
  { label: 'WhatsApp', value: 'Chat the tribe desk', href: 'https://wa.me/254700000000?text=VUNA%20support' },
  { label: 'Where', value: 'Nairobi, Kenya · Africa/Nairobi' },
  { label: 'Partners', value: 'Licensed CIS desks · Etica Capital MMF custody rail' },
]

export const PRIVACY_TITLE = 'Privacy and PII disclosures'
export const PRIVACY_BODY = [
  'VUNA is built for the Kenya Data Protection Act. We collect the least we need to run STK Push, Friday wrap, and tribe invites.',
  'Safaricom MSISDNs are stored on the server as 254XXXXXXXXX inside an HttpOnly session cookie. This device keeps a mask only (2547****1234). Raw numbers are not written to logs, analytics, or Pulse copy.',
  'The M-Pesa PIN is never typed in VUNA. It is entered on the Safaricom prompt. We do not ask for, store, or infer PINs.',
  'Daraja Consumer Key, Consumer Secret, and Passkey live only on the server. They are never shipped in VITE_ bundles or this page.',
  'Habit locks, wrap toggles, and card name live in local storage on this phone unless you connect a profile. Erasing the device clears local VUNA data. It does not reverse M-Pesa.',
  'Questions on access or erasure: hello@vuna.app. Nairobi, Kenya.',
]

export const CMA_TITLE = 'CMA compliance notes'
export const CMA_BODY = [
  'VUNA is engineered for evaluation under the Capital Markets Authority Regulatory Sandbox Framework. It is not a CMA-licensed collective investment scheme, a bank, or a deposit-taking product.',
  'Protocol lock is a behavioral commitment rail. Whole-shilling KES moves only after a Daraja callback (ResultCode 0) for a CheckoutRequestID we issued. Yield on the Harvest card is a display of verified consistency, not a promised return.',
  'Where funds sit in a money market fund, custody is with a licensed CIS fund manager. Etica MMF is referenced as a Kenya money-market custody rail. Projected calculator yield uses a ~10% illustrative MMF rate and is not advice or a forecast.',
  'M-Pesa collections use Safaricom Daraja. Callbacks are idempotent on CheckoutRequestID and MpesaReceiptNumber. Amount mismatches are not credited.',
  'Partner and regulator desks: hello@vuna.app.',
]
