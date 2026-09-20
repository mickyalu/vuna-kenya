import { Lock, Radar, User, Wheat } from 'lucide-react'
import type { TabId } from '../types'
import { useVuna } from '../store/VunaContext'

const TABS: {
  id: TabId
  label: string
  icon: typeof Wheat
  idleClass: string
}[] = [
  { id: 'harvest', label: 'Harvest', icon: Wheat, idleClass: 'text-[#6B8E23]' },
  { id: 'lock', label: 'Lock', icon: Lock, idleClass: 'text-[#F59E0B]' },
  { id: 'pulse', label: 'Pulse', icon: Radar, idleClass: 'text-[#9CA3AF]' },
  { id: 'profile', label: 'Profile', icon: User, idleClass: 'text-[#7C6AE6]' },
]

export function BottomNav() {
  const { tab, setTab } = useVuna()

  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-vuna-border bg-vuna-bg/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
      <ul className="grid grid-cols-4 items-end px-2">
        {TABS.map(({ id, label, icon: Icon, idleClass }) => {
          const active = tab === id
          return (
            <li key={id} className="flex justify-center">
              <button
                type="button"
                onClick={() => setTab(id)}
                className="flex flex-col items-center gap-1 px-2"
                aria-current={active ? 'page' : undefined}
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                    active ? 'bg-vuna-raised' : 'bg-transparent'
                  }`}
                >
                  <Icon
                    className={active && id === 'harvest' ? 'text-[#9ACD32]' : idleClass}
                    strokeWidth={1.75}
                    size={26}
                    fill={id === 'profile' ? 'currentColor' : 'none'}
                  />
                </span>
                <span
                  className={`text-[11px] font-medium ${
                    active ? 'text-vuna-lime' : 'text-vuna-muted'
                  }`}
                >
                  {label}
                </span>
                <span
                  className={`h-1 w-1 rounded-full ${active ? 'bg-vuna-lime' : 'bg-transparent'}`}
                />
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
