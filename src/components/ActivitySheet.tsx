import { useState } from 'react'
import { X } from 'lucide-react'
import { PILLAR_CATALOG, type PillarId } from '../lib/pillars'
import { ACTIVITIES } from '../lib/tribes'

type Props = {
  pillar: PillarId
  onClose: () => void
  onPick: (activity: string) => void
}

export function ActivitySheet({ pillar, onClose, onPick }: Props) {
  const meta = PILLAR_CATALOG[pillar]
  const options = ACTIVITIES[pillar] ?? []
  const [custom, setCustom] = useState('')

  const submitCustom = () => {
    const next = custom.trim()
    if (!next) return
    onPick(next)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 z-0 bg-black/55"
        aria-label="Cancel activity"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[88svh] w-full max-w-[430px] overflow-y-auto rounded-t-[28px] border-t border-vuna-border bg-[#1a1a1a] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-[22px] font-bold tracking-tight text-white">
            {meta.label.charAt(0) + meta.label.slice(1).toLowerCase()} Activity
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2a2a2a] text-vuna-muted"
            aria-label="Cancel"
          >
            <X size={16} />
          </button>
        </div>
        <p className="mb-3 text-[14px] text-vuna-muted">Select Activity</p>
        <div className="space-y-2.5">
          {options.map((activity) => (
            <button
              key={activity}
              type="button"
              onClick={() => onPick(activity)}
              className="w-full rounded-2xl bg-[#2a2a2a] px-4 py-4 text-left text-[16px] font-medium text-white"
            >
              {activity}
            </button>
          ))}
        </div>
        <form
          className="mt-4 border-t border-[#2a2a2a] pt-4"
          onSubmit={(e) => {
            e.preventDefault()
            submitCustom()
          }}
        >
          <p className="mb-2 text-[13px] text-vuna-muted">Not on the list? Type your own.</p>
          <div className="flex items-center gap-2">
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="e.g. Evening walk"
              className="min-w-0 flex-1 rounded-2xl bg-[#2a2a2a] px-4 py-3.5 text-[15px] text-white outline-none placeholder:text-vuna-dim"
            />
            <button
              type="submit"
              disabled={!custom.trim()}
              className="shrink-0 rounded-2xl bg-vuna-lime px-4 py-3.5 text-[14px] font-semibold text-black disabled:opacity-40"
            >
              Use
            </button>
          </div>
        </form>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full rounded-full py-3 text-[15px] font-semibold text-vuna-lime"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
