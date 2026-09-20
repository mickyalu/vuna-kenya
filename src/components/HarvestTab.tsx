import { ChevronDown, Plus, Send } from 'lucide-react'
import { formatKes } from '../lib/money'
import { useVuna } from '../store/VunaContext'
import { PILLARS, type PillarId } from '../types'

const PILLAR_META: Record<
  PillarId,
  { emoji: string; label: string }
> = {
  FITNESS: { emoji: '🏃', label: 'FITNESS' },
  HEALTH: { emoji: '❤️', label: 'HEALTH' },
  HABITS: { emoji: '✓', label: 'HABITS' },
  LIFESTYLE: { emoji: '🌿', label: 'LIFESTYLE' },
}

export function HarvestTab() {
  const {
    deposits,
    tickingYield,
    goalName,
    progressPct,
    lines,
    updateLine,
    addLine,
    cancelProtocol,
    commitProtocol,
    commitmentTotal,
    protocolError,
    pillars,
  } = useVuna()

  return (
    <div className="space-y-5 pb-4">
      <section className="rounded-2xl border border-[#2a3a00] bg-vuna-card px-5 pb-5 pt-6">
        <p className="text-center text-[11px] font-semibold tracking-[0.18em] text-vuna-muted">
          VUNA PROTOCOL BALANCE
        </p>
        <p className="mt-3 text-center text-[44px] font-semibold leading-none tracking-tight text-white">
          {formatKes(deposits)}
        </p>
        <p className="mt-4 text-center text-[12px] tracking-[0.08em] text-vuna-muted">
          FOR:{' '}
          <span className="font-semibold tracking-[0.14em] text-white">
            {goalName.toUpperCase()}
          </span>
        </p>
        <div className="mt-5 flex items-center gap-3">
          <div className="h-[5px] flex-1 overflow-hidden rounded-full bg-[#2a2a2a]">
            <div
              className="h-full rounded-full bg-vuna-lime"
              style={{ width: `${Math.max(progressPct, 8)}%` }}
            />
          </div>
          <p className="shrink-0 text-[12px] font-medium text-vuna-mint">
            +{formatKes(tickingYield, 4)} Yield Ticking
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-vuna-border bg-vuna-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[13px] font-bold tracking-[0.08em] text-white">
            QUICK PROTOCOL ENTRY
          </h2>
          <button
            type="button"
            onClick={cancelProtocol}
            className="text-[13px] font-semibold text-vuna-lime"
          >
            Cancel
          </button>
        </div>

        <div className="space-y-3">
          {lines.map((line) => (
            <div
              key={line.id}
              className="flex items-center gap-3 rounded-2xl bg-vuna-raised px-3 py-3"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2a2418] text-lg">
                🌅
              </div>
              <div className="min-w-0 flex-1">
                <input
                  value={line.description}
                  onChange={(e) => updateLine(line.id, { description: e.target.value })}
                  placeholder="e.g., 5am wake up"
                  className="w-full bg-transparent text-[14px] italic text-white outline-none placeholder:text-vuna-dim"
                />
                <div className="relative mt-1">
                  <select
                    value={line.pillar}
                    onChange={(e) =>
                      updateLine(line.id, { pillar: e.target.value as PillarId | '' })
                    }
                    className="w-full appearance-none bg-transparent py-0.5 pr-6 text-[11px] font-semibold tracking-[0.12em] text-vuna-muted outline-none"
                  >
                    <option value="">SELECT PILLAR...</option>
                    {PILLARS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="pointer-events-none absolute right-0 top-1 text-vuna-muted"
                  />
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1 text-vuna-muted">
                <span className="text-[13px]">KES</span>
                <input
                  inputMode="decimal"
                  value={line.amount}
                  onChange={(e) => updateLine(line.id, { amount: e.target.value })}
                  placeholder="0"
                  className="w-10 bg-transparent text-right text-[16px] font-medium text-white outline-none placeholder:text-vuna-dim"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addLine}
          className="mt-3 flex items-center gap-1 text-[13px] font-semibold text-vuna-lime"
        >
          <Plus size={14} strokeWidth={2.5} />
          Add Another
        </button>

        {protocolError ? (
          <p className="mt-3 text-[12px] text-[#f07167]">{protocolError}</p>
        ) : null}

        <div className="mt-4 flex items-end justify-between border-t border-vuna-border pt-4">
          <div>
            <p className="text-[12px] text-vuna-muted">Total Commitment</p>
            <p className="mt-1 text-[28px] font-semibold leading-none text-vuna-lime">
              {formatKes(commitmentTotal)}
            </p>
          </div>
          <button
            type="button"
            onClick={commitProtocol}
            aria-label="Submit protocol entry"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2a2a2a] text-white transition active:scale-95"
          >
            <Send size={20} className="-translate-x-0.5 translate-y-0.5" />
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[15px] font-bold tracking-[0.12em] text-white">
          ATOMIC HABIT PILLARS
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {PILLARS.map((id) => {
            const meta = PILLAR_META[id]
            return (
              <article
                key={id}
                className="rounded-2xl border border-vuna-border bg-vuna-card px-3 pb-4 pt-5 text-center"
              >
                <p className="text-[20px] font-semibold text-vuna-lime">
                  {formatKes(pillars[id])}
                </p>
                <p className="mt-1 text-[10px] font-semibold tracking-[0.2em] text-vuna-dim">
                  {meta.label}
                </p>
                <p className="mt-3 text-[28px] leading-none">{meta.emoji}</p>
                <p className="mt-3 text-[16px] font-bold tracking-wide text-white">
                  {meta.label}
                </p>
                <p className="mt-1 text-[10px] font-semibold tracking-[0.16em] text-vuna-dim">
                  TOTAL ACCUMULATED
                </p>
                <div className="mx-auto mt-3 h-px w-16 bg-vuna-border" />
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
