/** Who receives a Vuna Gift. The payer is never the beneficiary. */

export function normalizeRecipientHandle(raw: string): string | null {
  const body = raw.trim().replace(/^@+/, '')
  if (!/^[A-Za-z0-9._]{2,24}$/.test(body)) return null
  return `@${body}`
}

/** Daraja AccountReference is 12 characters. The full handle is stored separately. */
export function giftAccountReference(handle: string): string {
  const body = handle.replace(/^@+/, '').replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  return (body || 'GIFT').slice(0, 12)
}
