import { X } from 'lucide-react'
import { KesAmount } from './KesAmount'
import { parseKesInput } from '../lib/money'
import { useVuna } from '../store/VunaContext'

export function StkSheet() {
  const { stk, closeStk, confirmStk, lines, mpesaPhone } = useVuna()
  if (!stk.open || !stk.lineId) return null

  const line = lines.find((item) => item.id === stk.lineId)
  if (!line) return null

  const pushing = stk.status === 'pushing'
  const kes = parseKesInput(line.amount)

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center">
      <button type="button" className="absolute inset-0 bg-black/65" onClick={closeStk} aria-label="Cancel STK" />
      <div className="relative z-10 w-full max-w-[430px] rounded-t-[28px] border-t border-vuna-border bg-[#121212] px-5 pb-6 pt-5">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">M-PESA STK</p>
            <h2 className="mt-1 text-[20px] font-bold text-white">Confirm lock</h2>
          </div>
          <button
            type="button"
            onClick={closeStk}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-vuna-raised text-vuna-muted"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-[14px] text-vuna-muted">
          Safaricom will prompt <span className="text-white">{mpesaPhone}</span> to lock{' '}
          <KesAmount value={kes} className="text-[14px]" /> on {line.description}.
        </p>
        <p className="mt-2 text-[12px] text-vuna-dim">
          Demo prompt — Daraja STK will replace this. Money does not leave this device yet.
        </p>
        {stk.error ? <p className="mt-3 text-[12px] text-[#f07167]">{stk.error}</p> : null}
        <button
          type="button"
          onClick={confirmStk}
          disabled={pushing}
          className="mt-5 w-full rounded-full bg-vuna-lime py-3 text-[15px] font-semibold text-black disabled:opacity-60"
        >
          {pushing ? 'Waiting for PIN…' : 'Send STK'}
        </button>
        <button type="button" onClick={closeStk} className="mt-2 w-full py-3 text-[14px] text-vuna-muted">
          Cancel
        </button>
      </div>
    </div>
  )
}
