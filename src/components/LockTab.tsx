import { ChevronRight, Send } from 'lucide-react'
import { KesAmount } from './KesAmount'
import { useYieldTick } from '../lib/useYieldTick'
import { useVuna } from '../store/VunaContext'

export function LockTab() {
  const {
    goalName,
    progressPct,
    lockMonths,
    daysRemaining,
    deposits,
    yieldEarned,
    openTransfer,
  } = useVuna()
  const liveYield = useYieldTick(yieldEarned, 0.0003, 1200)
  const liveHarvest = deposits + liveYield

  return (
    <div className="space-y-5 pb-4">
      <section className="pt-2 text-center">
        <CommitmentArc value={72} />
        <p className="font-display mt-1 text-[22px] text-vuna-lime">
          BEHAVIORAL COMMITMENT INDEX
        </p>
        <p className="mt-1 text-[12px] text-vuna-muted">
          Verified Consistency:{' '}
          <span className="font-semibold text-white">Level 4 Institutional</span>
        </p>
      </section>

      <section className="rounded-[22px] border border-vuna-border bg-vuna-card px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[18px] font-semibold text-white">{goalName}</h2>
          <span className="rounded-full bg-[#1f2a00] px-2.5 py-1 font-amount text-[11px] text-vuna-lime">
            {progressPct.toFixed(1)}%
          </span>
        </div>
        <div className="mt-4 h-[5px] overflow-hidden rounded-full bg-[#2a2a2a]">
          <div
            className="h-full rounded-full bg-vuna-lime"
            style={{ width: `${Math.max(progressPct, 6)}%` }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-[12px] text-vuna-muted">
          <span>Locked: {lockMonths} Months</span>
          <span>{daysRemaining} Days Remaining</span>
        </div>
      </section>

      <section className="rounded-[22px] border border-vuna-border bg-vuna-card px-4 py-5">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">
          ESTIMATED HARVEST
        </p>
        <p className="mt-2 leading-none">
          <KesAmount value={liveHarvest} tone="mint" className="text-[40px] leading-none" />
        </p>
        <div className="mt-5 space-y-2 text-[14px]">
          <div className="flex items-center justify-between">
            <span className="text-vuna-muted">Deposits</span>
            <KesAmount value={deposits} className="text-[15px]" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-vuna-muted">Yield earned</span>
            <KesAmount value={liveYield} tone="mint" className="text-[15px]" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[12px] font-semibold tracking-[0.16em] text-vuna-muted">
          LIQUIDITY PROTOCOL
        </h2>
        <button
          type="button"
          onClick={openTransfer}
          className="flex w-full items-center gap-3 rounded-[22px] border border-vuna-border bg-vuna-card px-3 py-3 text-left"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-vuna-lime text-black">
            <Send size={18} className="-translate-x-0.5 translate-y-0.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[16px] font-semibold text-white">Vuna Transfer</span>
            <span className="block text-[13px] text-vuna-muted">Send to M-Pesa number</span>
          </span>
          <ChevronRight size={18} className="text-vuna-dim" />
        </button>
      </section>
    </div>
  )
}

function CommitmentArc({ value }: { value: number }) {
  const r = 78
  const cx = 100
  const cy = 100
  const start = Math.PI
  const end = 2 * Math.PI
  const length = Math.PI * r
  const dash = (value / 100) * length

  const arc = (from: number, to: number) => {
    const x1 = cx + r * Math.cos(from)
    const y1 = cy + r * Math.sin(from)
    const x2 = cx + r * Math.cos(to)
    const y2 = cy + r * Math.sin(to)
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`
  }

  return (
    <svg viewBox="0 0 200 118" className="mx-auto h-[132px] w-[240px]">
      <defs>
        <filter id="bci-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d={arc(start, end)}
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d={arc(start, end)}
        fill="none"
        stroke="#CCFF00"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${length}`}
        filter="url(#bci-glow)"
      />
    </svg>
  )
}
