import { X } from 'lucide-react'
import { PILLAR_CATALOG, type PillarId } from '../lib/pillars'
import { ACTIVITIES } from '../lib/tribes'

type Props = {
  pillar: PillarId
  onClose: () => void
  onPick: (activity: string) => void
  onOther: () => void
}

export function ActivitySheet({ pillar, onClose, onPick, onOther }: Props) {
  const meta = PILLAR_CATALOG[pillar]
  const options = ACTIVITIES[pillar] ?? []

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 z-0 bg-black/55"
        aria-label="Cancel activity"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-[430px] rounded-t-[28px] border-t border-vuna-border bg-[#1a1a1a] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5">
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
        <div className="mt-4 border-t border-[#2a2a2a] pt-3">
          <button
            type="button"
            onClick={onOther}
            className="w-full py-2 text-left text-[14px] text-vuna-muted"
          >
            Other Activity
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full rounded-full py-3 text-[15px] font-semibold text-vuna-lime"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
