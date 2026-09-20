import { ChevronDown } from 'lucide-react'
import { KesAmount } from './KesAmount'
import { PILLAR_CATALOG, type PillarId } from '../lib/pillars'
import { useVuna } from '../store/VunaContext'

export function LiveProtocols() {
  const {
    lines,
    updateLine,
    cancelProtocol,
    commitmentTotal,
    protocolError,
    lockPrompt,
    liveOpen,
    setLiveOpen,
    requestStk,
    openLog,
  } = useVuna()

  const drafts = lines.filter((l) => l.status === 'draft' && (l.description || l.amount || l.pillar))
  const locked = lines.filter((l) => l.status === 'locked')
  const count = drafts.length + locked.length
  const ready = locked[0]

  return (
    <section id="protocol-entry" className="rounded-[22px] border border-vuna-border bg-vuna-card">
      {ready && !liveOpen ? (
        <button
          type="button"
          onClick={() => openLog(ready.id)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <span>
            <span className="block text-[12px] font-extrabold tracking-[0.12em] text-vuna-lime">
              I DID IT
            </span>
            <span className="block text-[13px] text-white">{ready.description}</span>
          </span>
          <span className="rounded-full bg-vuna-lime px-3 py-1.5 text-[12px] font-semibold text-black">
            Log
          </span>
        </button>
      ) : (
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
              {count === 0
                ? 'Open a pillar to lock. This strip is only live locks.'
                : `${locked.length} locked · ${drafts.length} unpaid`}
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
      )}

      {liveOpen ? (
        <div className="border-t border-vuna-border px-4 pb-4 pt-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[12px] text-vuna-muted">STK first. Log after you actually did it.</p>
            <button
              type="button"
              onClick={cancelProtocol}
              className="text-[13px] font-semibold text-vuna-lime"
            >
              Cancel unpaid
            </button>
          </div>

          {lockPrompt ? (
            <p className="mb-3 text-[12px] leading-snug text-vuna-mint">{lockPrompt}</p>
          ) : null}

          <div className="space-y-2">
            {lines
              .filter((line) => line.description || line.status === 'locked')
              .map((line) => (
                <div key={line.id} className="rounded-2xl bg-vuna-raised px-3 py-3">
                  <p className="text-[14px] font-medium text-white">
                    {line.description || 'Unnamed habit'}
                  </p>
                  <p className="text-[11px] tracking-[0.12em] text-vuna-dim">
                    {line.pillar ? PILLAR_CATALOG[line.pillar as PillarId].label : 'NO PILLAR'}
                    {line.status === 'locked' ? ' · LOCKED' : ' · UNPAID'}
                  </p>
                  {line.status === 'draft' ? (
                    <>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="font-amount text-[13px] text-vuna-muted">KES</span>
                        <input
                          inputMode="numeric"
                          value={line.amount}
                          onChange={(e) => updateLine(line.id, { amount: e.target.value })}
                          placeholder="0"
                          className="font-amount min-w-0 flex-1 bg-transparent text-right text-[22px] text-vuna-lime outline-none placeholder:text-vuna-dim"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => requestStk(line.id)}
                        className="mt-3 w-full rounded-full bg-vuna-lime py-2.5 text-[13px] font-semibold text-black"
                      >
                        Send STK
                      </button>
                    </>
                  ) : line.status === 'pending' ? (
                    <p className="mt-3 text-[12px] text-vuna-mint">
                      Waiting for M-Pesa callback. Not credited yet.
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openLog(line.id)}
                      className="mt-3 w-full rounded-full bg-vuna-lime py-2.5 text-[13px] font-semibold text-black"
                    >
                      I did it
                    </button>
                  )}
                </div>
              ))}
          </div>

          {protocolError ? (
            <p className="mt-3 text-[12px] text-[#f07167]">{protocolError}</p>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
