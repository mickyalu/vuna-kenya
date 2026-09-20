import { ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { KesAmount } from './KesAmount'
import { PILLAR_CATALOG, PILLARS } from '../lib/pillars'
import { useVuna } from '../store/VunaContext'

type Props = {
  swapSlot: number
  onPick: (id: (typeof PILLARS)[number]) => void
}

export function PillarDrawer({ swapSlot, onPick }: Props) {
  const { pillars, pinnedPillars } = useVuna()
  const [open, setOpen] = useState(false)
  const extras = PILLARS.filter((id) => !pinnedPillars.includes(id))
  const replacing = PILLAR_CATALOG[pinnedPillars[swapSlot]]

  return (
    <div className="mt-3 overflow-hidden rounded-[22px] border border-vuna-border bg-vuna-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3"
        aria-expanded={open}
      >
        <span className="flex items-center gap-3">
          <span className="mx-auto block h-1 w-10 rounded-full bg-[#333]" />
          <span className="text-left">
            <span className="block text-[12px] font-semibold tracking-[0.14em] text-white">
              MORE ATOMIC HABITS
            </span>
            <span className="block text-[11px] text-vuna-muted">
              {open
                ? `Replacing ${replacing.label} on the board`
                : `${extras.length} more in the drawer`}
            </span>
          </span>
        </span>
        <ChevronUp
          size={18}
          className={`text-vuna-lime transition ${open ? 'rotate-0' : 'rotate-180'}`}
        />
      </button>

      {open ? (
        <div className="max-h-[320px] space-y-2 overflow-y-auto border-t border-vuna-border px-3 pb-3 pt-2">
          {extras.map((id) => {
            const meta = PILLAR_CATALOG[id]
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  onPick(id)
                  setOpen(false)
                }}
                className="flex w-full items-center gap-3 rounded-2xl bg-vuna-raised px-3 py-3 text-left"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-vuna-card text-lg">
                  {meta.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-bold tracking-wide text-white">
                    {meta.label}
                  </span>
                  <span className="block text-[12px] text-vuna-muted">{meta.blurb}</span>
                </span>
                <KesAmount value={pillars[id]} tone="lime" className="text-[15px]" />
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
