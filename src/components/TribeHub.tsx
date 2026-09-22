import { useState } from 'react'
import { Link2, Plus, X } from 'lucide-react'
import { PILLAR_CATALOG, PILLARS, type PillarId } from '../lib/pillars'
import { useVuna } from '../store/VunaContext'
import { AvatarStack } from './TribeChip'

export function TribeHub() {
  const {
    clubs,
    joinedIds,
    activeClub,
    joinClub,
    leaveClub,
    inviteClub,
    setActiveClub,
    avatarUrl,
  } = useVuna()
  const [creating, setCreating] = useState(false)

  const mine = clubs.filter((c) => joinedIds.includes(c.id))
  const discover = clubs.filter((c) => !joinedIds.includes(c.id))

  return (
    <section id="vuna-tribes">
      <div className="mb-3 flex items-end justify-between gap-2">
        <div>
          <h2 className="text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">TRIBES</h2>
          <p className="mt-1 text-[13px] leading-snug text-vuna-muted">
            {mine.length === 0
              ? 'Join one or start one. This is the only list of tribes.'
              : `You sit in ${activeClub.name}. Harvest highlights that one. Pulse shows only its activity.`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-1 rounded-full bg-vuna-lime px-3 py-1.5 text-[12px] font-semibold text-black"
        >
          <Plus size={14} />
          Create
        </button>
      </div>

      {mine.length === 0 ? (
        <p className="rounded-[22px] border border-dashed border-vuna-border px-4 py-5 text-[13px] leading-snug text-vuna-muted">
          You are not sitting in a tribe yet. Join one below, or create a circle and send the invite to friends or a WhatsApp community.
        </p>
      ) : null}

      <div className="space-y-2">
        {mine.map((club) => {
          const sitting = club.id === activeClub.id
          return (
            <article
              key={club.id}
              className={`rounded-[22px] border px-3 py-3 ${
                sitting ? 'border-vuna-lime bg-vuna-card' : 'border-vuna-border bg-vuna-card'
              }`}
            >
              <div className="flex items-start gap-3">
                <AvatarStack
                  faces={[
                    avatarUrl ? { src: avatarUrl, alt: 'You' } : null,
                    ...club.members.map((m) => ({ src: m.photo, alt: m.name })),
                  ].filter(Boolean) as { src: string; alt: string }[]}
                  size={32}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-white">{club.name}</p>
                  <p className="text-[12px] text-vuna-muted">{club.line}</p>
                  <p className="mt-1 text-[11px] text-vuna-mint">{club.live} live now</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveClub(club.id)}
                  className="flex-1 rounded-full bg-vuna-raised py-2 text-[12px] font-semibold text-white"
                >
                  {sitting ? 'Sitting here' : 'Sit here'}
                </button>
                <button
                  type="button"
                  onClick={() => inviteClub(club.id)}
                  className="flex items-center gap-1 rounded-full bg-vuna-lime px-3 py-2 text-[12px] font-semibold text-black"
                >
                  <Link2 size={14} />
                  Invite
                </button>
                <button
                  type="button"
                  onClick={() => leaveClub(club.id)}
                  className="rounded-full px-3 py-2 text-[12px] text-vuna-muted"
                >
                  Leave
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {discover.length ? (
        <>
          <p className="mb-2 mt-4 text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">
            DISCOVER
          </p>
          <div className="space-y-2">
            {discover.map((club) => (
              <article
                key={club.id}
                className="flex items-center gap-3 rounded-[22px] border border-vuna-border bg-vuna-card px-3 py-3"
              >
                <AvatarStack
                  faces={club.members.map((m) => ({ src: m.photo, alt: m.name }))}
                  size={28}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-white">{club.name}</p>
                  <p className="truncate text-[12px] text-vuna-muted">{club.line}</p>
                </div>
                <button
                  type="button"
                  onClick={() => joinClub(club.id)}
                  className="shrink-0 rounded-full bg-vuna-lime px-3 py-1.5 text-[12px] font-semibold text-black"
                >
                  Join
                </button>
              </article>
            ))}
          </div>
        </>
      ) : null}

      {creating ? <CreateTribeSheet onClose={() => setCreating(false)} /> : null}
    </section>
  )
}

function CreateTribeSheet({ onClose }: { onClose: () => void }) {
  const { createClub } = useVuna()
  const [name, setName] = useState('')
  const [line, setLine] = useState('')
  const [pillar, setPillar] = useState<PillarId>('FITNESS')

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center">
      <button type="button" className="absolute inset-0 bg-black/70" onClick={onClose} aria-label="Close" />
      <form
        className="relative z-10 w-full max-w-[430px] rounded-t-[28px] border-t border-vuna-border bg-[#121212] px-5 pb-8 pt-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (!name.trim()) return
          createClub({ name: name.trim(), line: line.trim(), pillar })
          onClose()
        }}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">NEW TRIBE</p>
            <h2 className="mt-1 text-[20px] font-bold text-white">Create a circle</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-vuna-raised text-vuna-muted"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <p className="mb-3 text-[13px] text-vuna-muted">
          After you create, we copy an invite link and open WhatsApp — same motion as sharing a Strava club.
        </p>
        <label className="mb-3 block">
          <span className="mb-1 block text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">
            NAME
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Karura Saturdays"
            className="w-full rounded-2xl bg-vuna-raised px-4 py-3 text-[15px] text-white outline-none placeholder:text-vuna-dim"
          />
        </label>
        <label className="mb-3 block">
          <span className="mb-1 block text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">
            ONE LINE
          </span>
          <input
            value={line}
            onChange={(e) => setLine(e.target.value)}
            placeholder="When and where you show up"
            className="w-full rounded-2xl bg-vuna-raised px-4 py-3 text-[15px] text-white outline-none placeholder:text-vuna-dim"
          />
        </label>
        <label className="mb-4 block">
          <span className="mb-1 block text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">
            PILLAR
          </span>
          <select
            value={pillar}
            onChange={(e) => setPillar(e.target.value as PillarId)}
            className="w-full rounded-2xl bg-vuna-raised px-4 py-3 text-[15px] text-white outline-none"
          >
            {PILLARS.map((id) => (
              <option key={id} value={id}>
                {PILLAR_CATALOG[id].emoji} {PILLAR_CATALOG[id].label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full rounded-full bg-vuna-lime py-3.5 text-[15px] font-semibold text-black disabled:opacity-40"
        >
          Create and invite
        </button>
      </form>
    </div>
  )
}
