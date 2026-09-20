export function formatKesDigits(value: number, fractionDigits = 2): string {
  const abs = Math.abs(value)
  return abs.toLocaleString('en-KE', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
}

export function formatKes(value: number, fractionDigits = 2): string {
  return `${value < 0 ? '-' : ''}KES ${formatKesDigits(value, fractionDigits)}`
}

export function parseKesInput(raw: string): number {
  const cleaned = raw.replace(/[^\d.]/g, '')
  if (!cleaned) return 0
  const n = Number.parseFloat(cleaned)
  return Number.isFinite(n) ? n : 0
}
