import { formatKesDigits } from '../lib/money'

const TONES = {
  white: 'text-white',
  lime: 'text-vuna-lime',
  mint: 'text-vuna-mint',
  muted: 'text-vuna-muted',
} as const

type KesAmountProps = {
  value: number
  digits?: number
  tone?: keyof typeof TONES
  className?: string
  prefix?: boolean
}

export function KesAmount({
  value,
  digits = 2,
  tone = 'white',
  className = '',
  prefix = true,
}: KesAmountProps) {
  return (
    <span className={`font-amount tabular-nums tracking-tight ${TONES[tone]} ${className}`}>
      {value < 0 ? '−' : ''}
      {prefix ? 'KES ' : ''}
      {formatKesDigits(Math.abs(value), digits)}
    </span>
  )
}
