import { useEffect, useState } from 'react'
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
import { VunaProvider, useVuna } from './store/VunaContext'
import { later, onHardwareBack } from './lib/runtime'

const SPLASH_HOLD_MS = 2200
const SPLASH_FADE_MS = 500

let splashBootAt = 0

function splashRemaining() {
  if (!splashBootAt) splashBootAt = Date.now()
  return Math.max(0, SPLASH_HOLD_MS - (Date.now() - splashBootAt))
}

function Shell() {
  const { tab, handleBack, profileEditOpen } = useVuna()

  useEffect(() => onHardwareBack(handleBack), [handleBack])

  return (
    <div className="min-h-svh bg-vuna-bg">
      <div className="mx-auto flex min-h-svh w-full max-w-[430px] flex-col bg-vuna-bg">
        <div className="flex items-center justify-end px-4 pt-3">
          <NoticeBell />
        </div>
        <main className="no-scrollbar flex-1 overflow-y-auto px-4 pb-28 pt-2">
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

export default function App() {
  const [loading, setLoading] = useState(true)
  const [splashMounted, setSplashMounted] = useState(true)

  useEffect(() => {
    return later(() => setLoading(false), splashRemaining())
  }, [])

  useEffect(() => {
    if (loading) return
    return later(() => setSplashMounted(false), SPLASH_FADE_MS)
  }, [loading])

  return (
    <ErrorBoundary>
      <VunaProvider>
        <Shell />
      </VunaProvider>
      {splashMounted ? <SplashScreen fading={!loading} /> : null}
    </ErrorBoundary>
  )
}
