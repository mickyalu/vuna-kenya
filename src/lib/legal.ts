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
]
