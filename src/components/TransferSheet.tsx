import { X } from 'lucide-react'
import { KesAmount } from './KesAmount'
import { useVuna } from '../store/VunaContext'

export function TransferSheet() {
  const { transfer, closeTransfer, updateTransfer, sendTransfer, deposits } = useVuna()

  if (!transfer.open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-0 sm:items-center">
      <div className="w-full max-w-[430px] rounded-t-3xl border border-vuna-border bg-vuna-card p-5 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">
              LIQUIDITY PROTOCOL
            </p>
            <h2 className="mt-1 text-[20px] font-bold text-white">Vuna Transfer</h2>
          </div>
          <button
            type="button"
            onClick={closeTransfer}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-vuna-raised text-vuna-muted"
            aria-label="Close transfer"
          >
            <X size={16} />
          </button>
        </div>

        <p className="mb-4 text-[13px] text-vuna-muted">
          Available to send:{' '}
          <KesAmount value={deposits} className="text-[13px]" />
        </p>

        <label className="mb-3 block">
          <span className="mb-1 block text-[11px] font-semibold tracking-[0.12em] text-vuna-muted">
            M-PESA NUMBER
          </span>
          <input
            value={transfer.phone}
            onChange={(e) => updateTransfer({ phone: e.target.value, error: null, success: null })}
            placeholder="07XX XXX XXX"
            inputMode="tel"
            className="w-full rounded-xl border border-vuna-border bg-vuna-raised px-3 py-3 text-[15px] text-white outline-none placeholder:text-vuna-dim"
          />
        </label>

        <label className="mb-4 block">
          <span className="mb-1 block text-[11px] font-semibold tracking-[0.12em] text-vuna-muted">
            AMOUNT (KES)
          </span>
          <input
            value={transfer.amount}
            onChange={(e) => updateTransfer({ amount: e.target.value, error: null, success: null })}
            placeholder="0.00"
            inputMode="decimal"
            className="font-amount w-full rounded-xl border border-vuna-border bg-vuna-raised px-3 py-3 text-[18px] text-white outline-none placeholder:text-vuna-dim"
          />
        </label>

        {transfer.error ? (
          <p className="mb-3 text-[12px] text-[#f07167]">{transfer.error}</p>
        ) : null}
        {transfer.success ? (
          <p className="mb-3 text-[12px] text-vuna-mint">{transfer.success}</p>
        ) : null}

        <button
          type="button"
          onClick={sendTransfer}
          className="w-full rounded-full bg-vuna-lime py-3 text-[15px] font-semibold text-black"
        >
          Send via M-Pesa
        </button>
      </div>
    </div>
  )
}
