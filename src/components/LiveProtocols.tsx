import { ChevronDown, Send } from 'lucide-react'
import { KesAmount } from './KesAmount'
import { PILLAR_CATALOG, type PillarId } from '../lib/pillars'
import { useVuna } from '../store/VunaContext'

export function LiveProtocols() {
  const {
    lines,
    updateLine,
    cancelProtocol,
    commitProtocol,
    commitmentTotal,
    protocolError,
    lockPrompt,
    liveOpen,
    setLiveOpen,
  } = useVuna()

  const count = lines.filter((l) => l.description || l.amount || l.pillar).length

  return (
    <section id="protocol-entry" className="rounded-[22px] border border-vuna-border bg-vuna-card">
      <button
        type="button"
        onClick={() => setLiveOpen(!liveOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={liveOpen}
      >
        <span>
          <span className="block text-[12px] font-extrabold tracking-[0.12em] text-white">
            LIVE PROTOCOLS
          </span>
          <span className="block text-[11px] text-vuna-muted">
            {count === 0 ? 'Tap a pillar to start a lock' : `${count} open · stake KES then send`}
          </span>
        </span>
        <span className="flex items-center gap-2">
          <KesAmount value={commitmentTotal} tone="lime" className="text-[18px]" />
          <ChevronDown
            size={16}
            className={`text-vuna-lime transition ${liveOpen ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {liveOpen ? (
        <div className="border-t border-vuna-border px-4 pb-4 pt-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[12px] text-vuna-muted">Open locks this session</p>
            <button
              type="button"
              onClick={cancelProtocol}
              className="text-[13px] font-semibold text-vuna-lime"
            >
              Cancel
            </button>
          </div>

          {lockPrompt ? (
            <p className="mb-3 text-[12px] leading-snug text-vuna-mint">{lockPrompt}</p>
          ) : null}

          <div className="space-y-2">
            {lines.map((line) => (
              <div key={line.id} className="rounded-2xl bg-vuna-raised px-3 py-3">
                <p className="text-[14px] font-medium text-white">
                  {line.description || 'Unnamed habit'}
                </p>
                <p className="text-[11px] tracking-[0.12em] text-vuna-dim">
                  {line.pillar ? PILLAR_CATALOG[line.pillar as PillarId].label : 'NO PILLAR'}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="font-amount text-[13px] text-vuna-muted">KES</span>
                  <input
                    inputMode="decimal"
                    value={line.amount}
                    onChange={(e) => updateLine(line.id, { amount: e.target.value })}
                    placeholder="0.00"
                    className="font-amount min-w-0 flex-1 bg-transparent text-right text-[22px] text-vuna-lime outline-none placeholder:text-vuna-dim"
                  />
                </div>
              </div>
            ))}
          </div>

          {protocolError ? (
            <p className="mt-3 text-[12px] text-[#f07167]">{protocolError}</p>
          ) : null}

          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-[12px] text-vuna-muted">Total to lock</p>
              <KesAmount value={commitmentTotal} tone="lime" className="text-[28px] leading-none" />
            </div>
            <button
              type="button"
              onClick={commitProtocol}
              aria-label="Lock live protocols"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-vuna-lime text-black"
            >
              <Send size={18} className="-translate-x-0.5 translate-y-0.5" />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
