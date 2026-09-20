/** Daraja PartyA / PhoneNumber: 254XXXXXXXXX (12 digits, no + or leading 0). */

const MSISDN = /^2547\d{8}$/

export function toMsisdn(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return null
  let n = digits
  if (n.startsWith('0') && n.length === 10) n = `254${n.slice(1)}`
  else if (n.startsWith('7') && n.length === 9) n = `254${n}`
  else if (!(n.startsWith('254') && n.length === 12)) return null
  return MSISDN.test(n) ? n : null
}

export function assertMsisdn(raw: string): string {
  const n = toMsisdn(raw)
  if (!n) {
    throw new Error('Enter a Safaricom number as 07XXXXXXXX or 2547XXXXXXXX.')
  }
  return n
}

export function isMsisdn(raw: string): boolean {
  return toMsisdn(raw) !== null
}
