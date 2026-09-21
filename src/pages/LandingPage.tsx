import { useEffect, useMemo, useState, type ReactNode } from 'react'
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
import { goApp } from '../lib/route'
import { later } from '../lib/runtime'
import { MMF_ANNUAL_RATE, projectHabitYield } from '../lib/yield'
import { KesAmount } from '../components/KesAmount'
import { PersonAvatar } from '../components/PersonAvatar'
import { useYieldTick } from '../lib/useYieldTick'

const PILLARS: PillarId[] = ['FITNESS', 'HEALTH', 'HABITS', 'LIFESTYLE']

type LegalKey = 'terms' | 'privacy' | 'cma' | 'contact'

const LEGAL: Record<LegalKey, { title: string; body: string[] }> = {
  terms: { title: TERMS_TITLE, body: TERMS_BODY },
  privacy: { title: PRIVACY_TITLE, body: PRIVACY_BODY },
  cma: { title: CMA_TITLE, body: CMA_BODY },
  contact: { title: CONTACT_TITLE, body: [] },
}

const TRUST = [
  {
    title: 'Regulated Fund Custody',
    line: 'Cash is invested directly into licensed Money Market Funds.',
  },
  {
    title: 'Instant M-Pesa Integration',
    line: 'Direct STK pushes to your phone with zero hidden fees.',
  },
  {
    title: 'Daily Interest Yields',
    line: 'Watch your micro-investments grow with daily compounding returns.',
  },
  {
    title: 'Bank-Grade Security',
    line: 'Encrypted transactions and total control over your funds anytime.',
  },
]

const LEGACY = [
  'Manual deposits',
  'Passive goal setting',
  'Boring reminders',
  'Disconnected from daily decisions',
]

const VUNA_DIFF = [
  'Instant M-Pesa the moment you log a habit',
  'Atomic habit triggers on Fitness, Health, Habits, Lifestyle',
  'Friday 18:00 WhatsApp wrap to keep the weekend honest',
  'Verified community streaks with your tribe',
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
              KENYA · KES · M-PESA
            </p>
            <h1 className="font-display mt-3 text-[48px] leading-[0.9] sm:text-[64px] lg:text-[76px]">
              WEALTH IS A BEHAVIOR, NOT A LUCK DRAW.
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-[#888888]">
              Turn your everyday wins into high-yield wealth. VUNA automatically invests small
              micro-deposits into Money Market Funds every time you log a healthy habit—earning daily
              interest straight from M-Pesa.
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
                {installed ? 'Open installed app' : 'Install PWA'}
              </button>
            </div>
            {hint ? (
              <p className="mt-3 text-[13px] text-[#888888]" role="status">
                {hint}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <AppStoreBadge onClick={() => goApp()} />
              <GooglePlayBadge onClick={() => goApp()} />
            </div>
          </div>
          <PhoneFrame>
            <HarvestPreview />
          </PhoneFrame>
        </section>

        <section className="border-y border-[#222222] bg-[#121212]">
          <div className="mx-auto max-w-[1120px] px-5 py-10">
            <p className="text-center text-[12px] font-semibold tracking-[0.18em] text-[#CCFF00]">
              BUILT FOR SECURITY &amp; SPEED
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {TRUST.map((item) => (
                <article key={item.title} className="rounded-[22px] border border-[#222222] bg-[#1A1A1A] px-4 py-5">
                  <h2 className="text-[16px] font-semibold leading-snug text-white">{item.title}</h2>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#888888]">{item.line}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1120px] px-5 py-16">
          <h2 className="font-display text-[40px] leading-none sm:text-[52px]">
            WHY VUNA REPLACES TRADITIONAL SAVINGS APPS
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] text-[#888888]">
            Traditional savings apps wait for you to remember to save. VUNA triggers instant M-Pesa
            deposits the moment you complete a daily habit.
          </p>
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            <article className="rounded-[22px] border border-[#222222] bg-[#121212] p-5">
              <h3 className="text-[18px] font-semibold text-[#888888]">Traditional Savings Apps</h3>
              <ul className="mt-4 space-y-3">
                {LEGACY.map((line) => (
                  <li key={line} className="border-t border-[#222222] pt-3 text-[14px] text-[#888888]">
                    {line}
                  </li>
                ))}
              </ul>
            </article>
            <article className="rounded-[22px] border border-[#CCFF00] bg-[#121212] p-5">
              <h3 className="text-[18px] font-semibold text-white">VUNA Behavioral Wealth</h3>
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

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[300px] sm:max-w-[320px] lg:max-w-[338px]">
      <div className="relative">
        <span className="absolute -left-[3px] top-[110px] h-8 w-[3px] rounded-l-sm bg-[#3a3a3a]" />
        <span className="absolute -left-[3px] top-[152px] h-14 w-[3px] rounded-l-sm bg-[#3a3a3a]" />
        <span className="absolute -left-[3px] top-[214px] h-14 w-[3px] rounded-l-sm bg-[#3a3a3a]" />
        <span className="absolute -right-[3px] top-[168px] h-20 w-[3px] rounded-r-sm bg-[#3a3a3a]" />
        <div className="relative overflow-hidden rounded-[46px] border-[3px] border-[#2c2c2c] bg-[#0d0d0d] p-[10px] shadow-[0_28px_70px_rgba(0,0,0,0.55)]">
          <div
            className="pointer-events-none absolute inset-0 z-20 rounded-[42px]"
            style={{
              background:
                'linear-gradient(118deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 28%, rgba(255,255,255,0) 48%)',
            }}
          />
          <div className="relative overflow-hidden rounded-[36px] bg-[#0A0A0A]">
            <div className="absolute left-1/2 top-[7px] z-30 h-[22px] w-[92px] -translate-x-1/2 rounded-full bg-black" />
            <div className="relative z-10 flex items-center justify-between px-6 pb-0.5 pt-[11px] text-[11px] font-semibold text-white">
              <span>9:41</span>
              <span className="w-[92px]" aria-hidden />
              <StatusCluster />
            </div>
            <div className="px-3 pb-2 pt-1">{children}</div>
            <div className="mx-auto mb-2 h-[5px] w-[108px] rounded-full bg-white/35" />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusCluster() {
  return (
    <span className="flex items-center gap-1" aria-hidden>
      <svg width="15" height="10" viewBox="0 0 15 10" fill="currentColor">
        <rect x="0" y="6" width="2.2" height="4" rx="0.4" />
        <rect x="3.4" y="4" width="2.2" height="6" rx="0.4" />
        <rect x="6.8" y="2" width="2.2" height="8" rx="0.4" />
        <rect x="10.2" y="0" width="2.2" height="10" rx="0.4" />
      </svg>
      <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
        <path
          d="M1.2 6.2a6 6 0 0 1 11.6 0"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M3.4 7.6a3.4 3.4 0 0 1 7.2 0"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <circle cx="7" cy="9" r="0.9" fill="currentColor" />
      </svg>
      <svg width="24" height="11" viewBox="0 0 24 11">
        <rect x="0.5" y="0.5" width="20" height="10" rx="2.2" stroke="currentColor" fill="none" />
        <rect x="2" y="2" width="14" height="7" rx="1.2" fill="#CCFF00" />
        <rect x="21.2" y="3.2" width="1.6" height="4.6" rx="0.6" fill="currentColor" />
      </svg>
    </span>
  )
}

function AppStoreBadge({ onClick }: { onClick: () => void }) {
  return (
    <a href="/app" onClick={(e) => { e.preventDefault(); onClick() }} aria-label="Download on the App Store" className="block">
      <svg width="148" height="44" viewBox="0 0 148 44" xmlns="http://www.w3.org/2000/svg">
        <rect width="148" height="44" rx="8" fill="#000" stroke="#8e8e8e" />
        <path
          fill="#fff"
          d="M24.7 21.6c0-3.3 2.7-4.9 2.8-5-1.5-2.2-3.9-2.5-4.7-2.5-2-.2-3.9 1.2-4.9 1.2-1 0-2.6-1.2-4.3-1.1-2.2.1-4.2 1.3-5.4 3.3-2.3 4-0.6 9.9 1.6 13.2 1.1 1.6 2.4 3.4 4.1 3.3 1.6-.1 2.3-1.1 4.2-1.1s2.5 1.1 4.3 1c1.8-.1 2.9-1.6 4-3.2 1.2-1.8 1.7-3.5 1.8-3.6-.1 0-3.4-1.3-3.5-5.2zm-3.3-9.5c.9-1.1 1.5-2.6 1.3-4.1-1.3.1-2.8.9-3.7 1.9-.8.9-1.5 2.4-1.3 3.8 1.4.1 2.8-.7 3.7-1.6z"
        />
        <text x="36" y="16" fill="#fff" fontFamily="Helvetica, Arial, sans-serif" fontSize="8">
          Download on the
        </text>
        <text x="36" y="32" fill="#fff" fontFamily="Helvetica, Arial, sans-serif" fontSize="16" fontWeight="600">
          App Store
        </text>
      </svg>
    </a>
  )
}

function GooglePlayBadge({ onClick }: { onClick: () => void }) {
  return (
    <a href="/app" onClick={(e) => { e.preventDefault(); onClick() }} aria-label="Get it on Google Play" className="block">
      <svg width="156" height="44" viewBox="0 0 156 44" xmlns="http://www.w3.org/2000/svg">
        <rect width="156" height="44" rx="8" fill="#000" stroke="#8e8e8e" />
        <polygon fill="#34A853" points="16.2,12.2 16.2,31.8 27.1,22" />
        <polygon fill="#FBBC04" points="16.2,22 27.1,22 32.4,26.5 16.2,31.8" />
        <polygon fill="#4285F4" points="32.4,17.5 27.1,22 32.4,26.5 35.2,24.8 35.2,19.2" />
        <polygon fill="#EA4335" points="16.2,12.2 32.4,17.5 27.1,22" />
        <text x="42" y="16" fill="#fff" fontFamily="Helvetica, Arial, sans-serif" fontSize="8">
          GET IT ON
        </text>
        <text x="42" y="32" fill="#fff" fontFamily="Helvetica, Arial, sans-serif" fontSize="15" fontWeight="600">
          Google Play
        </text>
      </svg>
    </a>
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
    <div>
      <p className="mb-2 flex items-center justify-between px-1">
        <span className="text-[10px] font-semibold tracking-[0.16em] text-[#555555]">HARVEST</span>
        <span className="text-[10px] font-semibold text-[#CCFF00]">LIVE</span>
      </p>
      <section
        className="relative overflow-hidden rounded-[18px] border border-[#3d4f00] px-3 pb-3 pt-3"
        style={{ background: 'linear-gradient(135deg, #243600 0%, #1a2a12 42%, #12180c 100%)' }}
      >
        <p className="text-[10px] font-semibold tracking-[0.22em] text-[#c8e67a]">KES BALANCE</p>
        <p className="mt-2">
          <KesAmount value={2400} className="text-[30px] leading-none" />
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
            <PersonAvatar src="/faces/otieno.jpg" alt="Michael.A" size={26} />
            <p className="text-[12px] font-semibold text-white">Michael.A</p>
          </div>
          <p className="text-[10px] font-semibold tracking-[0.16em] text-[#CCFF00]">KES RAIL</p>
        </div>
      </section>
      <article className="mt-2 rounded-[18px] border border-[#222222] bg-[#121212] px-3 py-3">
        <p className="text-[10px] font-semibold tracking-[0.16em] text-[#888888]">STK PUSH</p>
        <p className="mt-1 text-[14px] font-semibold text-white">05:00 run · FITNESS</p>
        <p className="mt-0.5 font-amount text-[20px] text-white">KES 100</p>
        <button
          type="button"
          onClick={() => setStk('pending')}
          disabled={stk !== 'idle'}
          className="mt-2 w-full rounded-full bg-[#CCFF00] py-2.5 text-[13px] font-semibold text-black disabled:opacity-70"
        >
          {stk === 'idle' ? 'Send STK' : stk === 'pending' ? 'Waiting on M-Pesa…' : 'Locked. KES 100 invested.'}
        </button>
        {stk === 'locked' ? (
          <p className="mt-2 flex items-center gap-1 text-[11px] text-[#3DD68C]">
            <Check size={13} /> M-Pesa confirmed. Your habit is earning.
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
      <div className="rounded-2xl bg-[#121212] px-3 py-3">
        <p className="text-[12px] font-semibold text-[#CCFF00]">🟩 Weekly Report | Sep 14 – Sep 20</p>
        <p className="mt-1 text-[15px] font-semibold text-white">Your Week on VUNA 🌾</p>
        <p className="mt-2 text-[12px] leading-relaxed text-[#888888]">
          Here is everything you accomplished with VUNA this week. Numbers are pulled straight from
          your behavioral dashboard.
        </p>
        <div className="mt-3 rounded-xl border border-[#222222] px-3 py-4 text-center">
          <p className="font-amount text-[28px] leading-none text-white">KES 2,400</p>
          <p className="mt-2 text-[10px] font-semibold tracking-[0.16em] text-[#888888]">
            TOTAL MICRO-SAVED
          </p>
        </div>
        <div className="mt-2 grid grid-cols-2 overflow-hidden rounded-xl border border-[#222222]">
          <div className="border-r border-b border-[#222222] px-3 py-3 text-center">
            <p className="font-amount text-[22px] leading-none">8</p>
            <p className="mt-1 text-[10px] font-semibold tracking-[0.12em] text-[#888888]">HABITS LOGGED</p>
          </div>
          <div className="border-b border-[#222222] px-3 py-3 text-center">
            <p className="font-amount text-[22px] leading-none">100%</p>
            <p className="mt-1 text-[10px] font-semibold tracking-[0.12em] text-[#888888]">CONSISTENCY</p>
          </div>
          <div className="border-r border-[#222222] px-3 py-3 text-center">
            <p className="font-amount text-[18px] leading-none">KES 34.50</p>
            <p className="mt-1 text-[10px] font-semibold tracking-[0.12em] text-[#888888]">YIELD GAINED</p>
          </div>
          <div className="px-3 py-3 text-center">
            <p className="font-amount text-[22px] leading-none">4</p>
            <p className="mt-1 text-[10px] font-semibold tracking-[0.12em] text-[#888888]">STREAK DAYS</p>
          </div>
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-white">
          🔥 Weekend Warning: Stay locked in! Keep your discipline steady over the weekend.
        </p>
        <p className="mt-2 text-[11px] text-[#888888]">📱 Manage notifications in your VUNA Profile settings.</p>
      </div>
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
