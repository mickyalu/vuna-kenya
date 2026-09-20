import { BottomNav } from './components/BottomNav'
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
        <main className="no-scrollbar flex-1 overflow-y-auto px-4 pb-28 pt-6">
          {tab === 'harvest' ? <HarvestTab /> : null}
          {tab === 'lock' ? <LockTab /> : null}
          {tab === 'pulse' ? <PulseTab /> : null}
          {tab === 'profile' ? <ProfileTab /> : null}
        </main>
        <BottomNav />
        <TransferSheet />
        <TribeDrawer />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <VunaProvider>
      <Shell />
    </VunaProvider>
  )
}
