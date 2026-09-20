import { X } from 'lucide-react'
import { PILLARS } from '../lib/pillars'
import { TRIBES } from '../lib/tribes'
import { useVuna } from '../store/VunaContext'
import { AvatarStack } from './TribeChip'

export function TribeDrawer() {
  const { tribeDrawerOpen, closeTribes, activeTribePillar, setActiveTribe } = useVuna()

  if (!tribeDrawerOpen) return null

  const ordered = [
    TRIBES[activeTribePillar],
    ...PILLARS.filter((id) => id !== activeTribePillar).map((id) => TRIBES[id]),
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65">
      <button type="button" className="absolute inset-0" aria-label="Close tribes" onClick={closeTribes} />
      <div className="relative max-h-[80svh] w-full max-w-[430px] overflow-y-auto rounded-t-[28px] border-t border-vuna-border bg-[#121212] px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#333]" />
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">SOCIAL TRIBES</p>
            <h2 className="mt-1 text-[22px] font-bold text-white">Your circles</h2>
          </div>
          <button
            type="button"
            onClick={closeTribes}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-vuna-raised text-vuna-muted"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="space-y-2">
          {ordered.map((tribe) => {
            const active = tribe.pillar === activeTribePillar
            return (
              <button
                key={tribe.pillar}
                type="button"
                onClick={() => setActiveTribe(tribe.pillar)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left ${
                  active ? 'border-vuna-lime bg-vuna-card' : 'border-vuna-border bg-vuna-card'
                }`}
              >
                <AvatarStack members={tribe.members} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold text-white">{tribe.name}</span>
                  <span className="block text-[12px] text-vuna-muted">{tribe.line}</span>
                </span>
                <span className="text-[11px] text-vuna-mint">{tribe.live} live</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
