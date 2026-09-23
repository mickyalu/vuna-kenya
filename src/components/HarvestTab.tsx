import { useState } from 'react'
import { KesAmount } from './KesAmount'
import { PillarGlyph } from './PillarGlyph'
import { PILLAR_CATALOG, type PillarId } from '../lib/pillars'
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
    activeClub,
    openTribes,
    avatarUrl,
    cardName,
  } = useVuna()
  const [swapSlot, setSwapSlot] = useState(0)
  const [activityPillar, setActivityPillar] = useState<PillarId | null>(null)

  const tribe = activeClub

  return (
    <div className="space-y-3 pb-4">
      <ProtocolCard />

      <section>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <h2 className="text-[13px] font-extrabold tracking-[0.12em] text-white">
            ATOMIC HABIT PILLARS
          </h2>
          <TribeChip
            tribe={tribe}
            onClick={openTribes}
            youUrl={avatarUrl}
            youName={cardName ?? undefined}
            compact
            label="Your tribe"
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
                className={`rounded-[22px] px-3 pb-4 pt-4 text-center transition ${meta.face} ${
                  selected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0a]' : ''
                }`}
              >
                <KesAmount
                  value={pillars[id]}
                  tone={meta.ink ? 'ink' : 'white'}
                  className="text-[26px] leading-none"
                />
                <span
                  className={`mx-auto mt-3 flex h-12 w-12 items-center justify-center rounded-full text-[24px] leading-none ${
                    id === 'HEALTH' || !meta.ink
                      ? 'bg-white shadow-[0_0_0_3px_rgba(255,255,255,0.55)]'
                      : 'bg-[#111111] shadow-[0_0_0_3px_rgba(17,17,17,0.28)]'
                  }`}
                >
                  <PillarGlyph id={id} size={26} tone={id === 'HEALTH' || !meta.ink ? 'accent' : 'on-face'} />
                </span>
                <p
                  className={`mt-2 text-[14px] font-extrabold tracking-wide ${
                    meta.ink ? 'text-[#111111]' : 'text-white'
                  }`}
                >
                  {meta.label}
                </p>
                <p
                  className={`mt-1 text-[10px] font-semibold tracking-[0.14em] ${
                    meta.ink ? 'text-black/55' : 'text-white/75'
                  }`}
                >
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
