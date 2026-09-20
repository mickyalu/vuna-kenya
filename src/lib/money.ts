export function formatKes(
  value: number,
  fractionDigits = 2,
): string {
  const abs = Math.abs(value)
  const formatted = abs.toLocaleString('en-KE', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
  return `${value < 0 ? '-' : ''}KES ${formatted}`
}

export function parseKesInput(raw: string): number {
  const cleaned = raw.replace(/[^\d.]/g, '')
  if (!cleaned) return 0
  const n = Number.parseFloat(cleaned)
  return Number.isFinite(n) ? n : 0
}
