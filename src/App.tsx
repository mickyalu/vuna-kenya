import { CongratsToast } from './components/CongratsToast'
import { GiftSheet } from './components/GiftSheet'
import { LockComposer } from './components/LockComposer'
import { LogSheet } from './components/LogSheet'
import { NoticeBell } from './components/NoticeBell'
import { NoticeInbox } from './components/NoticeInbox'
import { StkSheet } from './components/StkSheet'
import { TransferSheet } from './components/TransferSheet'
import { BottomNav } from './components/BottomNav'
import { ErrorBoundary } from './components/ErrorBoundary'
import { HarvestTab } from './components/HarvestTab'
import { LockTab } from './components/LockTab'
import { ProfileTab } from './components/ProfileTab'
import { PulseTab } from './components/PulseTab'
import { TribeDrawer } from './components/TribeDrawer'
import { VunaProvider, useVuna } from './store/VunaContext'

function Shell() {
  const { tab } = useVuna()

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
        <NoticeInbox />
        <CongratsToast />
        <TribeDrawer />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <VunaProvider>
        <Shell />
      </VunaProvider>
    </ErrorBoundary>
  )
}
