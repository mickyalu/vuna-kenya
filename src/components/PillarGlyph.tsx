import { HeartPulse } from 'lucide-react'
import { PILLAR_CATALOG, type PillarId } from '../lib/pillars'

type Tone = 'on-face' | 'accent'

type Props = {
  id: PillarId
  size?: number
  /** `accent` is the red pulse on a light badge or mixed background. `on-face` sits on the rose card. */
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

  return (
    <span className="leading-none" aria-hidden>
      {PILLAR_CATALOG[id].emoji}
    </span>
  )
}
