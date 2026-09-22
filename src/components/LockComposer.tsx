import { X } from 'lucide-react'
import { PILLAR_CATALOG, type PillarId } from '../lib/pillars'
import { parseKesInput } from '../lib/money'
import { toKesInteger } from '../lib/mpesa'
import { useVuna } from '../store/VunaContext'
import { KesAmount } from './KesAmount'
import { PillarGlyph } from './PillarGlyph'

export function LockComposer() {
  const {
    composer,
    updateComposer,
    closeComposer,
    sendComposerStk,
    mpesaPhone,
    setMpesaPhone,
  } = useVuna()

  if (!composer.open) return null

  const pillar = composer.pillar ? PILLAR_CATALOG[composer.pillar as PillarId] : null
  const kes = parseKesInput(composer.amount)
  const sending = composer.sending

  return (
    <div className="fixed inset-0 z-[75] flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        onClick={() => {
          if (!sending) closeComposer()
        }}
        aria-label="Close lock"
      />
      <div className="relative z-10 max-h-[92svh] w-full max-w-[430px] overflow-y-auto rounded-t-[28px] border-t border-vuna-border bg-[#121212] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#2a2a2a]" />
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">
              LOCK THIS HABIT
            </p>
            <h2 className="mt-1 text-[22px] font-bold leading-tight text-white">
              {composer.activity || 'Name this lock'}
            </h2>
            {composer.pillar ? (
              <p className="mt-1 flex items-center gap-1.5 text-[13px] text-vuna-muted">
                <PillarGlyph id={composer.pillar as PillarId} size={16} tone="accent" />
                {pillar?.label}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={closeComposer}
            disabled={sending}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-vuna-raised text-vuna-muted disabled:opacity-40"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <label className="block rounded-2xl bg-vuna-raised px-4 py-3">
          <span className="text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">
            AMOUNT
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-amount text-[16px] text-vuna-muted">KES</span>
            <input
              autoFocus
              inputMode="numeric"
              value={composer.amount}
              onChange={(e) => updateComposer({ amount: e.target.value })}
              placeholder="0"
              disabled={sending}
              className="font-amount min-w-0 flex-1 bg-transparent text-[32px] leading-none text-vuna-lime outline-none placeholder:text-vuna-dim"
            />
          </div>
        </label>

        <label className="mt-3 block">
          <span className="mb-1.5 block text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">
            CAPTION
          </span>
          <textarea
            value={composer.caption}
            onChange={(e) => updateComposer({ caption: e.target.value })}
            placeholder="What are you locking against? Optional."
            rows={2}
            disabled={sending}
            className="w-full resize-none rounded-2xl border border-vuna-border bg-vuna-raised px-3 py-3 text-[14px] text-white outline-none placeholder:text-vuna-dim"
          />
        </label>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-vuna-raised px-4 py-3">
          <div>
            <p className="text-[14px] font-semibold text-white">Post to Pulse</p>
            <p className="text-[12px] text-vuna-muted">
              {composer.postToPulse ? 'Tribe sees this lock.' : 'Keep it on your protocol only.'}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={composer.postToPulse}
            disabled={sending}
            onClick={() => updateComposer({ postToPulse: !composer.postToPulse })}
            className={`relative h-7 w-12 shrink-0 rounded-full transition ${
              composer.postToPulse ? 'bg-vuna-lime' : 'bg-[#2a2a2a]'
            }`}
          >
            <span
              className="absolute top-0.5 h-6 w-6 rounded-full bg-white transition-all"
              style={{ left: composer.postToPulse ? 22 : 2 }}
            />
          </button>
        </div>

        {composer.postToPulse ? (
          <div className="mt-3 flex rounded-full bg-vuna-raised p-1">
            <button
              type="button"
              disabled={sending}
              onClick={() => updateComposer({ visibility: 'public' })}
              className={`flex-1 rounded-full py-2 text-[13px] font-semibold ${
                composer.visibility === 'public' ? 'bg-vuna-lime text-black' : 'text-vuna-muted'
              }`}
            >
              Public
            </button>
            <button
              type="button"
              disabled={sending}
              onClick={() => updateComposer({ visibility: 'friends' })}
              className={`flex-1 rounded-full py-2 text-[13px] font-semibold ${
                composer.visibility === 'friends' ? 'bg-vuna-lime text-black' : 'text-vuna-muted'
              }`}
            >
              Friends
            </button>
          </div>
        ) : null}

        <label className="mt-3 block rounded-2xl border border-vuna-border bg-vuna-card px-4 py-3">
          <span className="text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">
            STK LANDS ON
          </span>
          <input
            value={mpesaPhone}
            onChange={(e) => setMpesaPhone(e.target.value)}
            placeholder="07XX XXX XXX"
            inputMode="tel"
            disabled={sending}
            className="mt-1 w-full bg-transparent text-[15px] text-white outline-none placeholder:text-vuna-dim"
          />
        </label>

        {composer.error ? (
          <p className="mt-3 text-[12px] text-[#f07167]">{composer.error}</p>
        ) : composer.sending ? (
          <p className="mt-3 text-[12px] leading-snug text-vuna-mint">
            Waiting for the M-Pesa callback. Balance will not move until ResultCode 0.
            {composer.checkoutRequestId ? (
              <span className="mt-1 block font-mono text-[11px] text-vuna-dim">
                {composer.checkoutRequestId}
              </span>
            ) : null}
          </p>
        ) : (
          <p className="mt-3 text-[12px] text-vuna-dim">
            STK amount is a whole shilling (KES {toKesInteger(composer.amount) || 0}). Enter PIN on the
            Safaricom prompt — VUNA never sees it.
          </p>
        )}

        <button
          type="button"
          onClick={sendComposerStk}
          disabled={sending}
          className="mt-4 w-full rounded-full bg-vuna-lime py-3.5 text-[15px] font-semibold text-black disabled:opacity-60"
        >
          {sending ? 'Waiting for M-Pesa…' : kes > 0 ? `Send STK · KES ${toKesInteger(composer.amount)}` : 'Send STK'}
        </button>
        <button
          type="button"
          onClick={closeComposer}
          disabled={sending}
          className="mt-1 w-full py-3 text-[14px] text-vuna-muted disabled:opacity-40"
        >
          Cancel
        </button>
        {kes > 0 ? (
          <p className="pb-1 text-center text-[11px] text-vuna-dim">
            Locking <KesAmount value={toKesInteger(composer.amount) || kes} className="text-[11px]" /> against {composer.activity}.
          </p>
        ) : null}
      </div>
    </div>
  )
}
