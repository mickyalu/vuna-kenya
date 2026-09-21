import { X } from 'lucide-react'
import { CONTACT_LINES, CONTACT_TITLE, OPT_OUT_TITLE, TERMS_BODY, TERMS_TITLE } from '../lib/legal'
import { useVuna } from '../store/VunaContext'

export type LegalPage = 'terms' | 'optout' | 'contact'

export function LegalSheet({
  page,
  onClose,
}: {
  page: LegalPage
  onClose: () => void
}) {
  const { wrapEnabled, setWrapEnabled, optOutTribes, eraseDevice } = useVuna()

  const title = page === 'terms' ? TERMS_TITLE : page === 'optout' ? OPT_OUT_TITLE : CONTACT_TITLE

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center">
      <button type="button" className="absolute inset-0 bg-black/70" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 max-h-[88svh] w-full max-w-[430px] overflow-y-auto rounded-t-[28px] border-t border-vuna-border bg-[#121212] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-[22px] font-bold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-vuna-raised text-vuna-muted"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {page === 'terms' ? (
          <div className="space-y-3 pb-4">
            {TERMS_BODY.map((para) => (
              <p key={para.slice(0, 24)} className="text-[14px] leading-relaxed text-vuna-muted">
                {para}
              </p>
            ))}
          </div>
        ) : null}

        {page === 'contact' ? (
          <div className="space-y-2 pb-4">
            <p className="mb-3 text-[14px] leading-relaxed text-vuna-muted">
              Desk is in Nairobi. We read WhatsApp faster than email.
            </p>
            {CONTACT_LINES.map((row) =>
              row.href ? (
                <a
                  key={row.label}
                  href={row.href}
                  className="block rounded-2xl bg-vuna-raised px-4 py-3"
                >
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">
                    {row.label.toUpperCase()}
                  </p>
                  <p className="mt-1 text-[15px] font-semibold text-vuna-lime">{row.value}</p>
                </a>
              ) : (
                <div key={row.label} className="rounded-2xl bg-vuna-raised px-4 py-3">
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">
                    {row.label.toUpperCase()}
                  </p>
                  <p className="mt-1 text-[15px] font-semibold text-white">{row.value}</p>
                </div>
              ),
            )}
          </div>
        ) : null}

        {page === 'optout' ? (
          <div className="space-y-3 pb-4">
            <p className="text-[14px] leading-relaxed text-vuna-muted">
              Leave the bits you do not want. Protocol locks already paid stay on this device until you erase it.
            </p>
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-vuna-raised px-4 py-3">
              <div>
                <p className="text-[14px] font-semibold text-white">Friday 18:00 wrap</p>
                <p className="text-[12px] text-vuna-muted">Weekly auditor message.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-label="Friday 18:00 wrap"
                aria-checked={wrapEnabled}
                onClick={() => setWrapEnabled(!wrapEnabled)}
                className={`relative h-7 w-12 shrink-0 rounded-full ${
                  wrapEnabled ? 'bg-vuna-lime' : 'bg-[#2a2a2a]'
                }`}
              >
                <span
                  className="absolute top-0.5 h-6 w-6 rounded-full bg-white"
                  style={{ left: wrapEnabled ? 22 : 2 }}
                />
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                optOutTribes()
                onClose()
              }}
              className="w-full rounded-2xl bg-vuna-raised px-4 py-3 text-left"
            >
              <p className="text-[14px] font-semibold text-white">Leave all tribes</p>
              <p className="text-[12px] text-vuna-muted">You can join again from Profile.</p>
            </button>
            <button
              type="button"
              onClick={eraseDevice}
              className="w-full rounded-2xl border border-[#5a2020] bg-[#1a1010] px-4 py-3 text-left"
            >
              <p className="text-[14px] font-semibold text-[#f07167]">Erase this device</p>
              <p className="text-[12px] text-vuna-muted">
                Clears local VUNA data on this phone. Does not reverse M-Pesa.
              </p>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
