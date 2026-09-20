import { KesAmount } from './KesAmount'
import { useVuna } from '../store/VunaContext'

export function ProtocolCard() {
  const { deposits, tickingYield, goalName, progressPct, firstName } = useVuna()

  return (
    <section className="relative overflow-hidden rounded-[22px] border border-[#2a3600] bg-[#141414] px-5 pb-4 pt-4">
      <div className="absolute inset-y-0 left-0 w-[3px] bg-vuna-lime" />
      <div
        className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(204,255,0,0.08) 0%, transparent 70%)' }}
      />

      <div className="flex items-start justify-between">
        <p className="text-[10px] font-semibold tracking-[0.22em] text-vuna-muted">
          VUNA PROTOCOL BALANCE
        </p>
        <ChipMark />
      </div>

      <p className="mt-3 leading-none">
        <KesAmount value={deposits} className="text-[42px] leading-none" />
      </p>

      <p className="mt-3 text-[11px] tracking-[0.12em] text-vuna-muted">
        FOR:{' '}
        <span className="font-semibold tracking-[0.14em] text-white">
          {goalName.toUpperCase()}
        </span>
      </p>

      <div className="mt-4 flex items-center gap-3">
        <div className="h-[5px] flex-1 overflow-hidden rounded-full bg-[#2a2a2a]">
          <div
            className="h-full rounded-full bg-vuna-lime"
            style={{ width: `${Math.max(progressPct, 8)}%` }}
          />
        </div>
        <p className="shrink-0 text-[11px] font-medium text-vuna-mint">
          +
          <KesAmount
            value={tickingYield}
            digits={4}
            tone="mint"
            className="text-[11px] font-medium"
          />{' '}
          Yield Ticking
        </p>
      </div>

      <div className="mt-4 flex items-end justify-between border-t border-white/5 pt-3">
        <div>
          <p className="text-[9px] tracking-[0.18em] text-vuna-dim">CARDHOLDER</p>
          <p className="mt-0.5 text-[13px] font-semibold tracking-[0.18em] text-white">
            {firstName.toUpperCase()}
          </p>
        </div>
        <p className="text-[10px] font-semibold tracking-[0.16em] text-vuna-muted">KES RAIL</p>
      </div>
    </section>
  )
}

function ChipMark() {
  return (
    <svg width="28" height="22" viewBox="0 0 28 22" aria-hidden>
      <rect x="0.5" y="0.5" width="27" height="21" rx="4" fill="#2a2a2a" stroke="#CCFF00" strokeOpacity="0.35" />
      <path d="M0 11h28M14 1v20" stroke="#3a3a3a" />
      <rect x="10" y="7" width="8" height="8" rx="1.5" fill="#3a3a3a" />
    </svg>
  )
}
