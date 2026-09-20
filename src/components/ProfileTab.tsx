import { useState } from 'react'
import { Calendar, ChevronRight, CircleCheck } from 'lucide-react'
import { useVuna } from '../store/VunaContext'
import { PersonAvatar } from './PersonAvatar'
import { TribeHub } from './TribeHub'
import { LegalSheet, type LegalPage } from './LegalSheet'

export function ProfileTab() {
  const {
    streak,
    totalWins,
    whatsappConnected,
    connectWhatsApp,
    wrapEnabled,
    setWrapEnabled,
    firstName,
    setFirstName,
    lastInitial,
    setLastInitial,
    cardName,
    avatarUrl,
    mpesaPhone,
    setMpesaPhone,
    giftWallet,
  } = useVuna()
  const [legal, setLegal] = useState<LegalPage | null>(null)

  return (
    <div className="space-y-6 pb-4">
      <header>
        <p className="text-[11px] font-semibold tracking-[0.18em] text-vuna-muted">
          THE REPUTATION
        </p>
        <h1 className="font-display mt-1 text-[52px] leading-[0.9] text-white">PROFILE</h1>
      </header>

      <label className="block rounded-[22px] border border-vuna-border bg-vuna-card px-4 py-3">
        <span className="text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">
          CARDHOLDER
        </span>
        <div className="mt-2 flex items-center gap-3">
          <PersonAvatar src={avatarUrl} alt={cardName} size={44} />
          <div className="min-w-0 flex-1">
            <div className="flex items-end">
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                aria-label="First name"
                className="min-w-[3ch] bg-transparent px-0 text-[18px] font-semibold tracking-tight text-white outline-none"
                style={{ fieldSizing: 'content', width: 'auto' }}
              />
              <span className="pb-px text-[18px] font-semibold text-white">.</span>
              <input
                value={lastInitial}
                onChange={(e) => setLastInitial(e.target.value)}
                maxLength={1}
                aria-label="Last initial"
                className="w-[1em] bg-transparent px-0 text-left text-[18px] font-semibold uppercase tracking-tight text-white outline-none"
              />
            </div>
            <p className="mt-0.5 text-[12px] text-vuna-muted">On the card as {cardName}</p>
          </div>
        </div>
      </label>

      <section className="rounded-[22px] border border-[#3d4f00] bg-[#141a08] px-4 py-4">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-vuna-lime">GIFT WALLET</p>
        <p className="mt-2 font-amount text-[32px] leading-none text-white">
          KES {giftWallet.toFixed(2)}
        </p>
        <p className="mt-2 text-[12px] leading-snug text-vuna-muted">
          Paybill credits land here in real time. They never touch protocol lock.
        </p>
      </section>

      <label className="block rounded-[22px] border border-vuna-border bg-vuna-card px-4 py-3">
        <span className="text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">
          M-PESA NUMBER FOR STK
        </span>
        <input
          value={mpesaPhone}
          onChange={(e) => setMpesaPhone(e.target.value)}
          placeholder="07XX XXX XXX"
          inputMode="tel"
          className="mt-1 w-full bg-transparent text-[16px] text-white outline-none placeholder:text-vuna-dim"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <article className="rounded-2xl border border-vuna-border bg-vuna-card px-3 py-6 text-center">
          <Calendar className="mx-auto text-vuna-muted" size={28} strokeWidth={1.5} />
          <p className="font-amount mt-4 text-[40px] leading-none text-white">{streak}</p>
          <p className="mt-3 text-[11px] font-semibold tracking-[0.14em] text-vuna-dim">
            VERIFIED STREAK
          </p>
        </article>
        <article className="rounded-2xl border border-vuna-border bg-vuna-card px-3 py-6 text-center">
          <CircleCheck className="mx-auto text-vuna-mint" size={28} strokeWidth={1.75} />
          <p className="font-amount mt-4 text-[40px] leading-none text-white">{totalWins}</p>
          <p className="mt-3 text-[11px] font-semibold tracking-[0.14em] text-vuna-dim">
            TOTAL WINS
          </p>
        </article>
      </div>

      <TribeHub />

      <section>
        <h2 className="mb-3 text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">
          SOCIAL LAYER
        </h2>
        <div className="rounded-2xl border border-vuna-border bg-vuna-card p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white">
              <WhatsAppMark />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-white">WhatsApp</p>
              <p className="text-[12px] text-vuna-muted">
                {whatsappConnected ? 'Connected for tribe invites' : 'Connect to share invite links'}
              </p>
            </div>
            {whatsappConnected ? (
              <span className="text-[12px] font-semibold text-vuna-lime">On</span>
            ) : (
              <button
                type="button"
                onClick={connectWhatsApp}
                className="rounded-full bg-[#25D366] px-4 py-2 text-[13px] font-semibold text-white"
              >
                Connect
              </button>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">
          AGENTIC NOTIFICATIONS
        </h2>
        <div className="flex items-center gap-3 rounded-2xl border border-vuna-border bg-vuna-card p-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-vuna-lime text-black">
            <ChatMark />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-white">Friday 18:00 Wrap</p>
            <p className="text-[12px] text-vuna-muted">Weekly Auditor Report</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={wrapEnabled}
            onClick={() => setWrapEnabled(!wrapEnabled)}
            className={`relative h-7 w-12 rounded-full transition ${
              wrapEnabled ? 'bg-vuna-lime' : 'bg-[#333]'
            }`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-black transition ${
                wrapEnabled ? 'left-[22px]' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">
          ACCOUNT
        </h2>
        <div className="overflow-hidden rounded-[22px] border border-vuna-border bg-vuna-card">
          {(
            [
              ['contact', 'Contact us'],
              ['terms', 'Terms and conditions'],
              ['optout', 'Opt out'],
            ] as const
          ).map(([id, label], index) => (
            <button
              key={id}
              type="button"
              onClick={() => setLegal(id)}
              className={`flex w-full items-center justify-between px-4 py-3.5 text-left ${
                index ? 'border-t border-vuna-border' : ''
              }`}
            >
              <span className="text-[15px] text-white">{label}</span>
              <ChevronRight size={16} className="text-vuna-dim" />
            </button>
          ))}
        </div>
      </section>

      {legal ? <LegalSheet page={legal} onClose={() => setLegal(null)} /> : null}
    </div>
  )
}

function WhatsAppMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.04 2c-5.46 0-9.91 4.44-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.44 9.91-9.91 0-2.65-1.03-5.14-2.90-7.01A9.82 9.82 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.21 8.21 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.39-4.19-1.15l-.3-.18-3.12.82.83-3.04-.20-.31a8.22 8.22 0 0 1-1.26-4.38c0-4.54 3.7-8.25 8.25-8.25zm-4.5 4.27c-.14.31-.73 1.07-.8 1.15-.07.09-.19.22-.07.45.12.23.53.87.6.93.07.07.14.14.27.07.13-.07.8-.3 1.53-.67.1-.05.16-.07.23.05.07.12.3.71.33.76.03.05.06.1.18.03s.9-.33 1.05-.37c.14-.03.24 0 .28.1.17.4.9 1.5 1.95 1.93.14.06.22.05.3-.03.08-.08.35-.4.44-.54.09-.14.18-.12.3-.07.13.05 1.11.52 1.3.62.19.09.32.14.37.22.05.08.05.73-.16 1.43-.21.7-1.22 1.27-1.7 1.32-.45.04-.9.2-3.03-.63-2.57-1-4.19-3.43-4.32-3.59-.12-.16-1.01-1.34-1.01-2.56 0-1.2.63-1.8.86-2.05.22-.24.48-.3.64-.3h.46c.14 0 .34-.05.52.4z" />
    </svg>
  )
}

function ChatMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 5v-5H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    </svg>
  )
}
