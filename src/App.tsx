import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { CongratsToast } from './components/CongratsToast'
import { GiftSheet } from './components/GiftSheet'
import { EditProfileSheet } from './components/EditProfileSheet'
import { LockComposer } from './components/LockComposer'
import { LogSheet } from './components/LogSheet'
import { NoticeBell } from './components/NoticeBell'
import { NoticeInbox } from './components/NoticeInbox'
import { SplashScreen } from './components/SplashScreen'
import { StkSheet } from './components/StkSheet'
import { TransferSheet } from './components/TransferSheet'
import { BottomNav } from './components/BottomNav'
import { ErrorBoundary } from './components/ErrorBoundary'
import { HarvestTab } from './components/HarvestTab'
import { LockTab } from './components/LockTab'
import { ProfileTab } from './components/ProfileTab'
import { PulseTab } from './components/PulseTab'
import { VunaMark } from './components/VunaMark'
import { VunaProvider, useVuna } from './store/VunaContext'
import { later, onHardwareBack } from './lib/runtime'
import { usePwaInstall } from './lib/pwa'
import {
  goLanding,
  markAppEntered,
  releaseScrollLock,
  shouldSkipAppSplash,
  syncViewport,
  useVunaRoute,
} from './lib/route'
import { LandingPage } from './pages/LandingPage'

const SPLASH_HOLD_MS = 2200
const SPLASH_FADE_MS = 500

let splashBootAt = 0

function splashRemaining() {
  if (!splashBootAt) splashBootAt = Date.now()
  return Math.max(0, SPLASH_HOLD_MS - (Date.now() - splashBootAt))
}

function AppChromeHeader() {
  const { install, installed } = usePwaInstall()

  return (
    <header className="shrink-0 border-b border-[#222222] bg-[#0A0A0A]/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-2 px-3 py-2 sm:px-5">
        <button
          type="button"
          onClick={() => goLanding()}
          className="flex min-w-0 items-center gap-2 text-left"
          aria-label="Back to Main Site"
        >
          <VunaMark className="h-7 w-7 shrink-0" />
          <span className="flex min-w-0 items-center gap-1 truncate text-[12px] font-semibold text-white sm:text-[13px]">
            <ArrowLeft size={14} strokeWidth={2.4} className="shrink-0" />
            Back to Main Site
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          {installed ? (
            <span className="rounded-full border border-[#CCFF00]/45 px-2.5 py-1 text-[11px] font-semibold text-[#CCFF00]">
              PWA Installed
            </span>
          ) : (
            <button
              type="button"
              onClick={() => void install()}
              className="rounded-full bg-[#CCFF00] px-2.5 py-1 text-[11px] font-semibold text-black"
            >
              Install App
            </button>
          )}
          <NoticeBell />
        </div>
      </div>
    </header>
  )
}

function Shell() {
  const { tab, handleBack, profileEditOpen } = useVuna()

  useEffect(
    () =>
      onHardwareBack(() => {
        if (handleBack()) return true
        goLanding()
        return true
      }),
    [handleBack],
  )

  return (
    <div className="flex h-svh max-h-svh flex-col overflow-hidden bg-vuna-bg">
      <AppChromeHeader />
      <div className="mx-auto flex min-h-0 w-full max-w-[430px] flex-1 flex-col overflow-hidden bg-vuna-bg">
        <main className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-28 pt-2">
          {tab === 'harvest' ? <HarvestTab /> : null}
          {tab === 'lock' ? <LockTab /> : null}
          {tab === 'pulse' ? <PulseTab /> : null}
          {tab === 'profile' ? <ProfileTab /> : null}
        </main>
        <BottomNav />
        <TransferSheet />
        <StkSheet />
        <LogSheet />
        <LockComposer />
        <GiftSheet />
        {profileEditOpen ? <EditProfileSheet /> : null}
        <NoticeInbox />
        <CongratsToast />
      </div>
    </div>
  )
}

function VunaDashboardApp() {
  const [skipSplash] = useState(() => shouldSkipAppSplash())
  const [loading, setLoading] = useState(() => !skipSplash)
  const [splashMounted, setSplashMounted] = useState(() => !skipSplash)

  useEffect(() => {
    markAppEntered()
  }, [])

  useEffect(() => {
    if (skipSplash) return
    return later(() => setLoading(false), splashRemaining())
  }, [skipSplash])

  useEffect(() => {
    if (loading) return
    if (!splashMounted) return
    return later(() => setSplashMounted(false), SPLASH_FADE_MS)
  }, [loading, splashMounted])

  return (
    <>
      <VunaProvider>
        <Shell />
      </VunaProvider>
      {splashMounted ? <SplashScreen fading={!loading} /> : null}
    </>
  )
}

export default function App() {
  const route = useVunaRoute()

  useEffect(() => {
    syncViewport(route)
    return () => releaseScrollLock()
  }, [route])

  return (
    <ErrorBoundary>
      {route === 'app' ? <VunaDashboardApp /> : <LandingPage />}
    </ErrorBoundary>
  )
}
