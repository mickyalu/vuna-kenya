import { ChevronDown } from 'lucide-react'
import { liveLockedTotal } from '../lib/live-protocols'
import { PILLAR_CATALOG, type PillarId } from '../lib/pillars'
import { useVuna } from '../store/VunaContext'
import { KesAmount } from './KesAmount'

export function LiveProtocols() {
  const {
    lines,
    updateLine,
    cancelProtocol,
    protocolError,
    lockPrompt,
    liveOpen,
    setLiveOpen,
    requestStk,
    openLog,
    liveProtocols,
  } = useVuna()

  const locked = liveProtocols.filter((row) => row.status === 'locked')
  const drafts = lines.filter((line) => line.status === 'draft' && (line.description || line.amount || line.pillar))
  const liveTotal = liveLockedTotal(liveProtocols)

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
            {locked.length === 0
              ? 'Open a pillar to lock. Paid locks show up here.'
              : `${locked.length} live · ticking`}
          </span>
        </span>
        <span className="flex items-center gap-2">
          <KesAmount value={liveTotal} tone="lime" digits={4} className="text-[18px]" />
          <ChevronDown
            size={16}
            className={`text-vuna-lime transition ${liveOpen ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {locked.length ? (
        <ul className="space-y-2 border-t border-vuna-border px-4 py-3">
          {locked.map((row) => (
            <li key={row.id} className="rounded-2xl bg-vuna-raised px-3 py-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[14px] font-medium text-white">{row.name}</p>
                <KesAmount value={row.liveKes} tone="lime" digits={4} className="text-[16px]" />
              </div>
              <p className="mt-1 text-[11px] tracking-[0.12em] text-vuna-dim">
                {row.pillar && row.pillar in PILLAR_CATALOG
                  ? PILLAR_CATALOG[row.pillar as PillarId].label
                  : 'LOCK'}
                {' · LOCKED · '}
                <KesAmount value={row.amountKes} tone="muted" className="text-[11px]" />
                {' + '}
                <KesAmount value={row.yieldKes} tone="mint" digits={4} className="text-[11px]" />
              </p>
              <button
                type="button"
                onClick={() => openLog(row.habitId)}
                className="mt-3 w-full rounded-full bg-vuna-lime py-2.5 text-[13px] font-semibold text-black"
              >
                I did it
              </button>
            </li>
          ))}
        </ul>
      ) : null}

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

          {drafts.length === 0 ? (
            <p className="text-[12px] text-vuna-muted">No unpaid locks waiting.</p>
          ) : (
            <div className="space-y-2">
              {drafts.map((line) => (
                <div key={line.id} className="rounded-2xl bg-vuna-raised px-3 py-3">
                  <p className="text-[14px] font-medium text-white">
                    {line.description || 'Unnamed habit'}
                  </p>
                  <p className="text-[11px] tracking-[0.12em] text-vuna-dim">
                    {line.pillar ? PILLAR_CATALOG[line.pillar as PillarId].label : 'NO PILLAR'}
                    {' · UNPAID'}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="font-amount text-[13px] text-vuna-muted">KES</span>
                    <input
                      inputMode="numeric"
                      value={line.amount}
                      onChange={(e) => updateLine(line.id, { amount: e.target.value })}
                      placeholder="0"
                      aria-label={`Amount for ${line.description || 'habit'}`}
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
                </div>
              ))}
            </div>
          )}

          {lines.some((line) => line.status === 'pending') ? (
            <p className="mt-3 text-[12px] text-vuna-mint">Waiting for M-Pesa callback. Not credited yet.</p>
          ) : null}

          {protocolError ? (
            <p className="mt-3 text-[12px] text-[#f07167]">{protocolError}</p>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
