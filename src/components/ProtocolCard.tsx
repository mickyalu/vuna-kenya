import { Eye, EyeOff } from 'lucide-react'
import { KesAmount } from './KesAmount'
import { useVuna } from '../store/VunaContext'
import { PersonAvatar } from './PersonAvatar'

export function ProtocolCard() {
  const {
    deposits,
    tickingYield,
    goalName,
    progressPct,
    cardName,
    avatarUrl,
    balanceHidden,
    toggleBalanceHidden,
    openProfileEdit,
  } = useVuna()

  return (
    <section
      className="relative overflow-hidden rounded-[22px] border border-[#3d4f00] px-4 pb-3 pt-3"
      style={{
        background:
          'linear-gradient(135deg, #243600 0%, #1a2a12 42%, #12180c 100%)',
      }}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(204,255,0,0.22) 0%, transparent 68%)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-10 left-8 h-24 w-40 rotate-12 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(61,214,140,0.12) 0%, transparent 70%)' }}
      />

      <div className="relative flex items-start justify-between">
        <p className="text-[10px] font-semibold tracking-[0.22em] text-[#c8e67a]">
          VUNA PROTOCOL BALANCE
        </p>
        <ChipMark />
      </div>

      <div className="relative mt-2 flex items-center gap-2">
        <p
          className={`leading-none ${balanceHidden ? 'select-none blur-[9px]' : ''}`}
          aria-hidden={balanceHidden}
        >
          <KesAmount value={deposits} className="text-[36px] leading-none" />
        </p>
        <button
          type="button"
          onClick={toggleBalanceHidden}
          className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-vuna-lime"
          aria-label={balanceHidden ? 'Show balance' : 'Hide balance'}
          aria-pressed={balanceHidden}
        >
          {balanceHidden ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <p className="relative mt-2 text-[11px] tracking-[0.12em] text-[#9aaa88]">
        FOR:{' '}
        <span className="font-semibold tracking-[0.14em] text-white">
          {goalName.toUpperCase()}
        </span>
      </p>

      <div className="relative mt-3 flex items-center gap-3">
        <div className="h-[5px] flex-1 overflow-hidden rounded-full bg-black/35">
          <div
            className="h-full rounded-full bg-vuna-lime"
            style={{ width: `${Math.max(progressPct, 8)}%` }}
          />
        </div>
        <p
          className={`shrink-0 text-[11px] font-medium text-vuna-mint ${
            balanceHidden ? 'select-none blur-[6px]' : ''
          }`}
        >
          +
          <KesAmount
            value={tickingYield}
            digits={4}
            tone="mint"
            className="text-[11px] font-medium"
          />{' '}
          Yield
        </p>
      </div>

      <div className="relative mt-3 flex items-center justify-between border-t border-white/10 pt-2.5">
        <button
          type="button"
          onClick={openProfileEdit}
          className="flex min-w-0 items-center gap-2 text-left"
          aria-label={cardName ? `Cardholder ${cardName}` : 'Add your name'}
        >
          <PersonAvatar src={avatarUrl} alt={cardName || 'You'} size={28} />
          <div className="min-w-0">
            <p className="text-[9px] tracking-[0.18em] text-[#8a9a70]">CARDHOLDER</p>
            <p className={`truncate text-[13px] font-semibold tracking-[0.08em] ${cardName ? 'text-white' : 'text-vuna-lime'}`}>
              {cardName ?? 'Add your name'}
            </p>
          </div>
        </button>
        <p className="text-[10px] font-semibold tracking-[0.16em] text-vuna-lime">KES RAIL</p>
      </div>
    </section>
  )
}

function ChipMark() {
  return (
    <svg width="28" height="22" viewBox="0 0 28 22" aria-hidden>
      <rect x="0.5" y="0.5" width="27" height="21" rx="4" fill="#d4af37" stroke="#CCFF00" strokeOpacity="0.5" />
      <path d="M0 11h28M14 1v20" stroke="#9a7b18" />
      <rect x="10" y="7" width="8" height="8" rx="1.5" fill="#f0d77a" />
    </svg>
  )
}
