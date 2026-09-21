import { Check, Gift, MessageCircle, Users, X } from 'lucide-react'
import { useVuna } from '../store/VunaContext'

export function NoticeInbox() {
  const { inbox, inboxOpen, closeInbox, setTab, setPulseTab } = useVuna()
  if (!inboxOpen) return null

  return (
    <div className="fixed inset-0 z-[88] flex items-end justify-center">
      <button type="button" className="absolute inset-0 bg-black/65" onClick={closeInbox} aria-label="Close notifications" />
      <div className="relative z-10 max-h-[80svh] w-full max-w-[430px] overflow-y-auto rounded-t-[28px] border-t border-vuna-border bg-[#121212] px-5 pb-8 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[20px] font-bold text-white">Notifications</h2>
          <button
            type="button"
            onClick={closeInbox}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-vuna-raised text-vuna-muted"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        {inbox.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-vuna-muted">Nothing yet. Gifts and lock receipts land here.</p>
        ) : (
          <div className="space-y-2">
            {inbox.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  closeInbox()
                  if (item.kind === 'gift_in' || item.kind === 'gift_sent' || item.kind === 'gift_reply') {
                    setTab('pulse')
                    setPulseTab('feed')
                  } else if (item.kind === 'tribe' || item.kind === 'wrap') {
                    setTab('profile')
                  }
                }}
                className="flex w-full items-start gap-3 rounded-2xl bg-vuna-raised px-3 py-3 text-left"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1f2a00] text-vuna-lime">
                  {item.kind === 'gift_reply' ? (
                    <MessageCircle size={14} />
                  ) : item.kind === 'stk' || item.kind === 'wrap' ? (
                    <Check size={14} />
                  ) : item.kind === 'tribe' ? (
                    <Users size={14} />
                  ) : (
                    <Gift size={14} />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold text-white">{item.title}</span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-vuna-muted">{item.body}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
