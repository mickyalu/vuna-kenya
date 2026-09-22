import { Check, HeartPulse } from 'lucide-react'
import { PILLAR_CATALOG, type PillarId } from '../lib/pillars'

type Tone = 'on-face' | 'accent'

type Props = {
  id: PillarId
  size?: number
  /** `accent` sits on a light badge. `on-face` sits directly on the pillar color. */
  tone?: Tone
}

export function PillarGlyph({ id, size = 22, tone = 'accent' }: Props) {
  if (id === 'HEALTH') {
    return (
      <HeartPulse
        size={size}
        strokeWidth={2.4}
        aria-hidden
        className={tone === 'on-face' ? 'text-[#111111]' : 'text-[#BE123C]'}
      />
    )
  }

  if (id === 'HABITS') {
    return (
      <Check
        size={size}
        strokeWidth={3}
        aria-hidden
        className={tone === 'on-face' ? 'text-white' : 'text-[#1E3A8A]'}
      />
    )
  }

  return (
    <span className="leading-none" aria-hidden>
      {PILLAR_CATALOG[id].emoji}
    </span>
  )
}
