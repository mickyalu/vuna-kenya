import { X } from 'lucide-react'
import { DEFAULT_GIFT_AMOUNT, GIFT_AMOUNTS, VUNA_PAYBILL } from '../lib/paybill'
import { KesAmount } from './KesAmount'
import { PersonAvatar } from './PersonAvatar'
import { useVuna } from '../store/VunaContext'

export function GiftSheet() {
  const {
    giftDraft,
    closeGift,
    setGiftAmount,
    sendGift,
    feed,
    mpesaPhone,
    setMpesaPhone,
  } = useVuna()

  if (!giftDraft.open || !giftDraft.postId) return null
  const post = feed.find((item) => item.id === giftDraft.postId)
  if (!post) return null

  const sending = giftDraft.sending

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        onClick={() => {
          if (!sending) closeGift()
        }}
        aria-label="Close gift"
      />
      <div className="relative z-10 w-full max-w-[430px] rounded-t-[28px] border-t border-vuna-border bg-[#121212] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">
              VUNA GIFT
            </p>
            <h2 className="mt-1 text-[20px] font-bold text-white">Send to {post.handle}</h2>
          </div>
          <button
            type="button"
            onClick={closeGift}
            disabled={sending}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-vuna-raised text-vuna-muted disabled:opacity-40"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-vuna-raised px-3 py-3">
          <PersonAvatar src={post.avatar} alt={post.handle} size={44} />
          <div>
            <p className="text-[14px] font-semibold text-white">{post.handle}</p>
            <p className="text-[12px] text-vuna-muted">{post.tribe}</p>
          </div>
        </div>

        <p className="mb-3 text-[13px] leading-snug text-vuna-muted">
          This is not a protocol lock. M-Pesa pays VUNA paybill{' '}
          <span className="font-semibold text-white">{VUNA_PAYBILL}</span>, account {post.handle}. We
          credit their profile wallet live.
        </p>

        <p className="mb-2 text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">AMOUNT</p>
        <div className="mb-4 grid grid-cols-3 gap-2">
          {GIFT_AMOUNTS.map((kes) => (
            <button
              key={kes}
              type="button"
              disabled={sending}
              onClick={() => setGiftAmount(kes)}
              className={`rounded-2xl py-3 font-amount text-[18px] ${
                giftDraft.amount === kes
                  ? 'bg-vuna-lime text-black'
                  : 'bg-vuna-raised text-white'
              }`}
            >
              {kes}
            </button>
          ))}
        </div>

        <label className="mb-3 block rounded-2xl border border-vuna-border bg-vuna-card px-4 py-3">
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

        {giftDraft.error ? (
          <p className="mb-3 text-[12px] text-[#f07167]">{giftDraft.error}</p>
        ) : (
          <p className="mb-3 text-[12px] text-vuna-dim">
            Demo STK to paybill {VUNA_PAYBILL} · KES {giftDraft.amount.toFixed(2)}. Protocol stays
            untouched.
          </p>
        )}

        <button
          type="button"
          onClick={sendGift}
          disabled={sending}
          className="w-full rounded-full bg-vuna-lime py-3.5 text-[15px] font-semibold text-black disabled:opacity-60"
        >
          {sending ? 'Waiting for PIN…' : `Send KES ${giftDraft.amount} to paybill`}
        </button>
        <button
          type="button"
          onClick={closeGift}
          disabled={sending}
          className="mt-1 w-full py-3 text-[14px] text-vuna-muted disabled:opacity-40"
        >
          Cancel
        </button>
        <p className="pb-1 text-center text-[11px] text-vuna-dim">
          They will see <KesAmount value={giftDraft.amount || DEFAULT_GIFT_AMOUNT} className="text-[11px]" /> on Pulse, from you.
        </p>
      </div>
    </div>
  )
}
