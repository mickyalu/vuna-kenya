import { useState } from 'react'
import { KesAmount } from './KesAmount'
import { PILLAR_CATALOG, type PillarId } from '../lib/pillars'
import { TRIBES } from '../lib/tribes'
import { useVuna } from '../store/VunaContext'
import { ActivitySheet } from './ActivitySheet'
import { LiveProtocols } from './LiveProtocols'
import { PillarDrawer } from './PillarDrawer'
import { ProtocolCard } from './ProtocolCard'
import { TribeChip } from './TribeChip'

export function HarvestTab() {
  const {
    pinnedPillars,
    pillars,
    promotePillar,
    chooseActivity,
    activeTribePillar,
    openTribes,
    avatarUrl,
    firstName,
  } = useVuna()
  const [swapSlot, setSwapSlot] = useState(0)
  const [activityPillar, setActivityPillar] = useState<PillarId | null>(null)

  const tribe = TRIBES[activeTribePillar]

  return (
    <div className="space-y-3 pb-4">
      <ProtocolCard />

      <section>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-[13px] font-extrabold tracking-[0.12em] text-white">
            ATOMIC HABIT PILLARS
          </h2>
          <TribeChip
            tribe={tribe}
            onClick={openTribes}
            youUrl={avatarUrl}
            youName={firstName}
            compact
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {pinnedPillars.map((id, slot) => {
            const meta = PILLAR_CATALOG[id]
            const selected = swapSlot === slot
            return (
              <button
                key={`${id}-${slot}`}
                type="button"
                onClick={() => {
                  setSwapSlot(slot)
                  setActivityPillar(id)
                }}
                className={`rounded-[22px] border px-3 pb-4 pt-4 text-center transition ${
                  selected ? 'border-vuna-lime bg-vuna-card' : 'border-vuna-border bg-vuna-card'
                }`}
              >
                <KesAmount value={pillars[id]} tone="lime" className="text-[20px] leading-none" />
                <p className="mt-3 text-[28px] leading-none">{meta.emoji}</p>
                <p className="mt-2 text-[14px] font-extrabold tracking-wide text-white">
                  {meta.label}
                </p>
                <p className="mt-1 text-[10px] font-semibold tracking-[0.14em] text-vuna-dim">
                  TOTAL ACCUMULATED
                </p>
              </button>
            )
          })}
        </div>
        <div className="mt-3">
          <PillarDrawer swapSlot={swapSlot} onPick={(id) => promotePillar(id, swapSlot)} />
        </div>
      </section>

      <LiveProtocols />

      {activityPillar ? (
        <ActivitySheet
          pillar={activityPillar}
          onClose={() => setActivityPillar(null)}
          onPick={(activity) => {
            chooseActivity(activityPillar, activity)
            setActivityPillar(null)
          }}
        />
      ) : null}
    </div>
  )
}
