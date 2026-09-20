/** CMA / DPA: never persist or log a raw MSISDN. */

export function maskMsisdn(msisdn: string): string {
  const digits = msisdn.replace(/\D/g, '')
  if (digits.length < 10) return '254*******'
  return `${digits.slice(0, 4)}****${digits.slice(-4)}`
}

export function maskInText(value: string): string {
  return value
    .replace(/\+?2547\d{8}/g, (m) => maskMsisdn(m))
    .replace(/\b07\d{8}\b/g, (m) => maskMsisdn(m))
}

export function looksLikePin(value: string): boolean {
  return /^\d{4}$/.test(value.trim())
}
