import { X } from 'lucide-react'
import { KesAmount } from './KesAmount'
import { maskMsisdn, toKesInteger, toMsisdn } from '../lib/mpesa'
import { useVuna } from '../store/VunaContext'

export function StkSheet() {
  const { stk, closeStk, confirmStk, lines, mpesaPhone, mpesaMasked } = useVuna()
  if (!stk.open || !stk.lineId) return null

  const line = lines.find((item) => item.id === stk.lineId)
  if (!line) return null

  const kes = stk.amountKes || toKesInteger(line.amount)
  const msisdn = toMsisdn(mpesaPhone)
  const shown = msisdn ? maskMsisdn(msisdn) : mpesaMasked || 'your Safaricom number'

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/65"
        onClick={() => {
          if (stk.status !== 'pending' && stk.status !== 'pushing') closeStk()
        }}
        aria-label="Cancel STK"
      />
      <div className="relative z-10 w-full max-w-[430px] rounded-t-[28px] border-t border-vuna-border bg-[#121212] px-5 pb-6 pt-5">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">M-PESA STK</p>
            <h2 className="mt-1 text-[20px] font-bold text-white">
              {stk.status === 'pending' ? 'Waiting on Safaricom' : 'Confirm lock'}
            </h2>
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
          Prompt lands on <span className="text-white">{shown}</span> for{' '}
          <KesAmount value={kes} className="text-[14px]" /> on {line.description}.
        </p>
        {stk.status === 'pending' ? (
          <div className="mt-4 rounded-2xl bg-vuna-raised px-4 py-3">
            <p className="text-[13px] font-semibold text-vuna-lime">Polling CheckoutRequestID</p>
            <p className="mt-1 break-all font-mono text-[11px] text-vuna-muted">
              {stk.checkoutRequestId}
            </p>
            <p className="mt-2 text-[12px] leading-snug text-vuna-dim">
              Enter the PIN on the Safaricom prompt. VUNA never sees it. Goal balance moves only after
              ResultCode 0 on the callback.
            </p>
          </div>
        ) : (
          <p className="mt-2 text-[12px] text-vuna-dim">
            Amount is a whole shilling. Daraja runs on the server — this device never holds the passkey.
          </p>
        )}
        {stk.error ? <p className="mt-3 text-[12px] text-[#f07167]">{stk.error}</p> : null}
        {stk.status === 'pending' || stk.status === 'pushing' ? null : (
          <button
            type="button"
            onClick={() => void confirmStk()}
            className="mt-5 w-full rounded-full bg-vuna-lime py-3 text-[15px] font-semibold text-black"
          >
            Send STK
          </button>
        )}
        {stk.status === 'pending' || stk.status === 'pushing' ? (
          <p className="mt-5 w-full rounded-full bg-vuna-raised py-3 text-center text-[15px] font-semibold text-vuna-lime">
            Waiting for M-Pesa…
          </p>
        ) : null}
        <button type="button" onClick={closeStk} className="mt-2 w-full py-3 text-[14px] text-vuna-muted">
          {stk.status === 'pending' ? 'Hide — keep waiting' : 'Cancel'}
        </button>
      </div>
    </div>
  )
}
