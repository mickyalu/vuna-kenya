import { useEffect, useMemo, useState } from 'react'
import { Check, Smartphone, X } from 'lucide-react'
import { PILLAR_CATALOG, type PillarId } from '../lib/pillars'
import {
  CMA_BODY,
  CMA_TITLE,
  CONTACT_LINES,
  CONTACT_TITLE,
  PRIVACY_BODY,
  PRIVACY_TITLE,
  TERMS_BODY,
  TERMS_TITLE,
} from '../lib/legal'
import { formatKes } from '../lib/money'
import { usePwaInstall } from '../lib/pwa'
import { formatWhatsAppReport } from '../lib/reports'
import { goApp } from '../lib/route'
import { later } from '../lib/runtime'
import { MMF_ANNUAL_RATE, projectHabitYield } from '../lib/yield'
import { KesAmount } from '../components/KesAmount'
import { PersonAvatar } from '../components/PersonAvatar'
import { useYieldTick } from '../lib/useYieldTick'

const PILLARS: PillarId[] = ['FITNESS', 'HEALTH', 'HABITS', 'LIFESTYLE']
const SAMPLE_WRAP = formatWhatsAppReport('Michael', 'Sep 14 – Sep 20', {
  total_saved_kes: 2400,
  habits_completed_count: 8,
  yield_earned_kes: 34.5,
  current_streak_days: 4,
  consistency_pct: 100,
})

type LegalKey = 'terms' | 'privacy' | 'cma' | 'contact'

const LEGAL: Record<LegalKey, { title: string; body: string[] }> = {
  terms: { title: TERMS_TITLE, body: TERMS_BODY },
  privacy: { title: PRIVACY_TITLE, body: PRIVACY_BODY },
  cma: { title: CMA_TITLE, body: CMA_BODY },
  contact: { title: CONTACT_TITLE, body: [] },
}

const TRUST = [
  { kicker: '01', title: 'CMA Regulatory Sandbox Framework', line: 'Built for Capital Markets Authority sandbox review. Not a licensed CIS.' },
  { kicker: '02', title: 'M-Pesa Daraja API Native', line: 'Whole-shilling STK Push. Balance moves only after ResultCode 0.' },
  { kicker: '03', title: 'Licensed CIS Custody Engine (Etica MMF)', line: 'Where cash sits in a money market fund, custody is with a licensed manager.' },
  { kicker: '04', title: 'Kenya Data Protection Act Compliant', line: 'Masked MSISDNs. No PINs on device. Server-only Daraja secrets.' },
]

const LEGACY = [
  'Manual deposits',
  'Passive goal setting',
  'Boring reminders',
  'Disconnected from daily decisions',
]

const VUNA_DIFF = [
  'Action-Triggered STK Push',
  'Atomic Habit Triggers',
  'Friday 18:00 Wrap WhatsApp Auditor',
  'Verified Community Streaks',
]

export function LandingPage() {
  const { install, installed, hint } = usePwaInstall()
  const [legal, setLegal] = useState<LegalKey | null>(null)
  const [pillar, setPillar] = useState<PillarId>('FITNESS')
  const [kes, setKes] = useState(100)
  const [freq, setFreq] = useState(3)
  const projection = useMemo(() => projectHabitYield(kes, freq), [kes, freq])
  const meta = PILLAR_CATALOG[pillar]

  return (
    <div className="min-h-svh bg-[#0A0A0A] text-white">
      <header className="sticky top-0 z-40 border-b border-[#222222] bg-[#0A0A0A]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-3 px-5 py-3">
          <a href="/" className="flex items-center gap-2" aria-label="VUNA home">
            <VunaMark />
            <span className="font-display text-[28px] leading-none tracking-[0.16em]">VUNA</span>
          </a>
          <div className="flex items-center gap-2">
            <p className="hidden text-[11px] font-semibold tracking-[0.14em] text-[#888888] sm:block">
              CMA SANDBOX · KENYA
            </p>
            <button
              type="button"
              onClick={() => goApp()}
              className="rounded-full bg-[#CCFF00] px-4 py-2 text-[13px] font-semibold text-black"
            >
              Launch Web App ➔
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-[1120px] items-center gap-12 px-5 py-12 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="text-[12px] font-semibold tracking-[0.2em] text-[#CCFF00]">
              KENYA · KES · M-PESA DARAJA
            </p>
            <h1 className="font-display mt-3 text-[48px] leading-[0.9] sm:text-[64px] lg:text-[76px]">
              WEALTH IS A BEHAVIOR, NOT A LUCK DRAW.
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-[#888888]">
              Automate micro-investments into regulated Money Market Funds every time you log a daily
              habit. Powered by M-Pesa Daraja &amp; Licensed CIS Fund Managers in Kenya.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => goApp()}
                className="rounded-full bg-[#CCFF00] px-6 py-3.5 text-[15px] font-semibold text-black"
              >
                Launch Web App ➔
              </button>
                <button
                type="button"
                onClick={() => (installed ? goApp() : void install())}
                className="rounded-full border border-[#222222] bg-[#121212] px-6 py-3.5 text-[15px] font-semibold text-white"
              >
                {installed ? 'Installed — Open App' : 'Install App (PWA)'}
              </button>
            </div>
            {hint ? (
              <p className="mt-3 text-[13px] text-[#888888]" role="status">
                {hint}
              </p>
            ) : null}
            {installed ? (
              <p className="mt-3 text-[13px] text-[#888888]">This browser already has VUNA on the home screen.</p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-2">
              <StorePill label="Google Play" />
              <StorePill label="App Store" />
            </div>
          </div>
          <HarvestPreview />
        </section>

        <section className="border-y border-[#222222] bg-[#121212]">
          <div className="mx-auto grid max-w-[1120px] gap-3 px-5 py-8 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST.map((item) => (
              <article key={item.kicker} className="rounded-[22px] border border-[#222222] bg-[#1A1A1A] px-4 py-4">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-[#CCFF00]">{item.kicker}</p>
                <h2 className="mt-2 text-[15px] font-semibold leading-snug text-white">{item.title}</h2>
                <p className="mt-2 text-[12px] leading-relaxed text-[#888888]">{item.line}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1120px] px-5 py-16">
          <h2 className="font-display text-[40px] leading-none sm:text-[52px]">
            WHY VUNA REPLACES TRADITIONAL SAVINGS APPS
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] text-[#888888]">
            Chumz-style micro-savings wait for you to remember. VUNA fires an STK the moment a habit
            is logged, then audits the week on WhatsApp before Friday night.
          </p>
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            <article className="rounded-[22px] border border-[#222222] bg-[#121212] p-5">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-[#555555]">COLUMN A</p>
              <h3 className="mt-2 text-[18px] font-semibold text-[#888888]">Legacy micro-savings</h3>
              <ul className="mt-4 space-y-3">
                {LEGACY.map((line) => (
                  <li key={line} className="border-t border-[#222222] pt-3 text-[14px] text-[#888888]">
                    {line}
                  </li>
                ))}
              </ul>
            </article>
            <article className="rounded-[22px] border border-[#CCFF00] bg-[#121212] p-5">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-[#CCFF00]">COLUMN B</p>
              <h3 className="mt-2 text-[18px] font-semibold text-white">VUNA Behavioral Wealth</h3>
              <ul className="mt-4 space-y-3">
                {VUNA_DIFF.map((line) => (
                  <li key={line} className="border-t border-[#222222] pt-3 text-[14px] font-medium text-white">
                    {line}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="border-y border-[#222222] bg-[#121212]">
          <div className="mx-auto max-w-[1120px] px-5 py-16">
            <h2 className="font-display text-[40px] leading-none sm:text-[52px]">
              CALCULATE YOUR BEHAVIORAL YIELD
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] text-[#888888]">
              Select a pillar and frequency to see how small habit choices compound over 12 months in
              an MMF. Illustrative ~{Math.round(MMF_ANNUAL_RATE * 100)}% annual rate. Not a forecast.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {PILLARS.map((id) => {
                const item = PILLAR_CATALOG[id]
                const on = pillar === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPillar(id)}
                    className={`rounded-full px-4 py-2 text-[13px] font-semibold ${
                      on ? 'bg-[#CCFF00] text-black' : 'border border-[#222222] bg-[#1A1A1A] text-white'
                    }`}
                  >
                    {item.emoji} {item.label}
                  </button>
                )
              })}
            </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-6 rounded-[22px] border border-[#222222] bg-[#1A1A1A] p-5">
                <label className="block">
                  <span className="flex items-center justify-between text-[11px] font-semibold tracking-[0.16em] text-[#888888]">
                    KES PER HABIT
                    <span className="font-amount text-[18px] tracking-normal text-white">{formatKes(kes, 0)}</span>
                  </span>
                  <input
                    type="range"
                    className="vuna-range mt-3"
                    min={100}
                    max={2000}
                    step={50}
                    value={kes}
                    onChange={(e) => setKes(Number(e.target.value))}
                    aria-label="KES deposit per habit"
                  />
                </label>
                <label className="block">
                  <span className="flex items-center justify-between text-[11px] font-semibold tracking-[0.16em] text-[#888888]">
                    FREQUENCY PER WEEK
                    <span className="font-amount text-[18px] tracking-normal text-white">{freq}×</span>
                  </span>
                  <input
                    type="range"
                    className="vuna-range mt-3"
                    min={1}
                    max={7}
                    step={1}
                    value={freq}
                    onChange={(e) => setFreq(Number(e.target.value))}
                    aria-label="Locks per week"
                  />
                </label>
                <p className="text-[13px] text-[#888888]">
                  {meta.emoji} {meta.label} · {meta.blurb} {freq} lock{freq === 1 ? '' : 's'} each week
                  at {formatKes(kes, 0)}.
                </p>
              </div>
              <article className="rounded-[22px] border border-[#CCFF00] bg-[#0A0A0A] p-5">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-[#CCFF00]">12-MONTH HARVEST</p>
                <dl className="mt-4 space-y-4">
                  <div>
                    <dt className="text-[12px] text-[#888888]">Total Annual Micro-Saved (KES)</dt>
                    <dd className="font-amount mt-1 text-[28px] leading-none text-white">
                      {formatKes(projection.annualSavedKes, 0)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[12px] text-[#888888]">
                      Projected Compound Yield @ ~{Math.round(MMF_ANNUAL_RATE * 100)}% MMF Rate (KES)
                    </dt>
                    <dd className="font-amount mt-1 text-[28px] leading-none text-[#CCFF00]">
                      {formatKes(projection.yieldKes)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[12px] text-[#888888]">12-Month Total Harvest Balance (KES)</dt>
                    <dd className="font-amount mt-1 text-[28px] leading-none text-white">
                      {formatKes(projection.harvestKes)}
                    </dd>
                  </div>
                </dl>
              </article>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1120px] items-center gap-10 px-5 py-16 lg:grid-cols-2">
          <div>
            <p className="text-[12px] font-semibold tracking-[0.18em] text-[#CCFF00]">FRIDAY 18:00 EAT</p>
            <h2 className="font-display mt-2 text-[40px] leading-none sm:text-[52px]">
              GUARDING YOUR CAPITAL BEFORE THE WEEKEND HITS
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#888888]">
              Every Friday at 18:00 EAT the Weekly Auditor lands on WhatsApp. It pulls verified
              locks from your behavioral dashboard: micro-saved KES, habits logged, consistency,
              yield, streak. Then it nudges you to stay locked in Saturday.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-[#888888]">
              Toggle it on Profile. No Friday wrap until a Safaricom number is on file.
            </p>
          </div>
          <WhatsAppFrame />
        </section>

        <section className="border-t border-[#222222] bg-[#121212]">
          <div className="mx-auto max-w-[720px] px-5 py-16 text-center">
            <h2 className="font-display text-[44px] leading-none sm:text-[60px]">
              START BUILDING DISCIPLINE-BACKED WEALTH TODAY.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[15px] text-[#888888]">
              Launch the web app, log a habit, approve the STK. The first lock is a whole shilling.
            </p>
            <button
              type="button"
              onClick={() => goApp()}
              className="mt-8 rounded-full bg-[#CCFF00] px-10 py-4 text-[18px] font-semibold text-black"
            >
              Launch VUNA App ➔
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#222222]">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-[#555555]">VUNA · Nairobi · Africa/Nairobi</p>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-[#888888]">
            <button type="button" onClick={() => setLegal('terms')} className="hover:text-white">
              Terms of Service
            </button>
            <button type="button" onClick={() => setLegal('privacy')} className="hover:text-white">
              Privacy Policy (PII Disclosures)
            </button>
            <button type="button" onClick={() => setLegal('cma')} className="hover:text-white">
              CMA Compliance Notes
            </button>
            <button type="button" onClick={() => setLegal('contact')} className="hover:text-white">
              Contact &amp; Partner Support
            </button>
          </nav>
        </div>
      </footer>

      {legal ? (
        <LegalOverlay
          page={legal}
          onClose={() => setLegal(null)}
        />
      ) : null}
    </div>
  )
}

function StorePill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-[#222222] bg-[#1A1A1A] px-3 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-[#888888]">
      Coming Soon to {label}
    </span>
  )
}

function HarvestPreview() {
  const tick = useYieldTick(0.1641, 0.0003, 1200, true)
  const [stk, setStk] = useState<'idle' | 'pending' | 'locked'>('idle')

  useEffect(() => {
    if (stk !== 'pending') return
    return later(() => setStk('locked'), 1600)
  }, [stk])

  return (
    <div className="mx-auto w-full max-w-[390px] rounded-[32px] border border-[#222222] bg-[#0A0A0A] p-3">
      <div className="mb-3 flex items-center justify-between px-2">
        <span className="text-[11px] font-semibold tracking-[0.16em] text-[#555555]">HARVEST</span>
        <span className="text-[11px] font-semibold text-[#CCFF00]">LIVE PREVIEW</span>
      </div>
      <section
        className="relative overflow-hidden rounded-[22px] border border-[#3d4f00] px-4 pb-3 pt-3"
        style={{ background: 'linear-gradient(135deg, #243600 0%, #1a2a12 42%, #12180c 100%)' }}
      >
        <p className="text-[10px] font-semibold tracking-[0.22em] text-[#c8e67a]">KES BALANCE</p>
        <p className="mt-2">
          <KesAmount value={2400} className="text-[36px] leading-none" />
        </p>
        <p className="mt-2 text-[11px] tracking-[0.12em] text-[#9aaa88]">
          FOR: <span className="font-semibold text-white">GENERAL WEALTH</span>
        </p>
        <p className="mt-3 text-[11px] font-medium text-[#3DD68C]">
          +<KesAmount value={tick} digits={4} tone="mint" className="text-[11px] font-medium" /> Yield
          Ticking
        </p>
        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5">
          <div className="flex items-center gap-2">
            <PersonAvatar src="/faces/otieno.jpg" alt="Michael.A" size={28} />
            <p className="text-[13px] font-semibold text-white">Michael.A</p>
          </div>
          <p className="text-[10px] font-semibold tracking-[0.16em] text-[#CCFF00]">KES RAIL</p>
        </div>
      </section>
      <article className="mt-3 rounded-[22px] border border-[#222222] bg-[#121212] px-4 py-4">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-[#888888]">STK PUSH</p>
        <p className="mt-2 text-[16px] font-semibold text-white">05:00 run · FITNESS</p>
        <p className="mt-1 font-amount text-[22px] text-white">KES 100</p>
        <button
          type="button"
          onClick={() => setStk('pending')}
          disabled={stk !== 'idle'}
          className="mt-3 w-full rounded-full bg-[#CCFF00] py-3 text-[14px] font-semibold text-black disabled:opacity-70"
        >
          {stk === 'idle' ? 'Send STK' : stk === 'pending' ? 'Waiting on M-Pesa…' : 'Locked · ResultCode 0'}
        </button>
        {stk === 'locked' ? (
          <p className="mt-2 flex items-center gap-1 text-[12px] text-[#3DD68C]">
            <Check size={14} /> Callback credited. Habit is on the rail.
          </p>
        ) : null}
      </article>
    </div>
  )
}

function WhatsAppFrame() {
  return (
    <div className="rounded-[28px] border border-[#222222] bg-[#0B1410] p-4">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#CCFF00] text-black">
          <Smartphone size={18} />
        </span>
        <div>
          <p className="text-[14px] font-semibold text-white">VUNA Auditor</p>
          <p className="text-[11px] text-[#888888]">Friday 18:00 · WhatsApp</p>
        </div>
      </div>
      <pre className="overflow-x-auto whitespace-pre rounded-2xl bg-[#121212] px-3 py-3 font-mono text-[10px] leading-[1.45] text-[#E8E8E8]">
        {SAMPLE_WRAP}
      </pre>
    </div>
  )
}

function LegalOverlay({ page, onClose }: { page: LegalKey; onClose: () => void }) {
  const copy = LEGAL[page]
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button type="button" className="absolute inset-0 bg-black/70" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 max-h-[88svh] w-full max-w-[560px] overflow-y-auto rounded-t-[28px] border border-[#222222] bg-[#121212] px-5 py-4 sm:rounded-[28px]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-[22px] font-bold text-white">{copy.title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A1A1A] text-[#888888]"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        {page === 'contact' ? (
          <div className="space-y-2 pb-4">
            {CONTACT_LINES.map((row) =>
              row.href ? (
                <a key={row.label} href={row.href} className="block rounded-2xl bg-[#1A1A1A] px-4 py-3">
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-[#888888]">
                    {row.label.toUpperCase()}
                  </p>
                  <p className="mt-1 text-[15px] font-semibold text-[#CCFF00]">{row.value}</p>
                </a>
              ) : (
                <div key={row.label} className="rounded-2xl bg-[#1A1A1A] px-4 py-3">
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-[#888888]">
                    {row.label.toUpperCase()}
                  </p>
                  <p className="mt-1 text-[15px] font-semibold text-white">{row.value}</p>
                </div>
              ),
            )}
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {copy.body.map((para) => (
              <p key={para.slice(0, 32)} className="text-[14px] leading-relaxed text-[#888888]">
                {para}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function VunaMark() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" className="h-8 w-8" aria-hidden>
      <rect width="32" height="32" rx="8" fill="#121212" stroke="#222222" />
      <path d="M8 22c2-6 4.5-10 8-14 3.5 4 6 8 8 14" stroke="#CCFF00" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M16 8v14" stroke="#CCFF00" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}
