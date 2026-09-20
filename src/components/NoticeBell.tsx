import { Bell } from 'lucide-react'
import { useVuna } from '../store/VunaContext'

export function NoticeBell() {
  const { unreadCount, openInbox } = useVuna()

  return (
    <button
      type="button"
      onClick={openInbox}
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-vuna-border bg-vuna-card text-vuna-lime"
      aria-label={unreadCount ? `${unreadCount} notifications` : 'Notifications'}
    >
      <Bell size={18} />
      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-vuna-lime px-1 text-[10px] font-bold text-black">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      ) : null}
    </button>
  )
}
