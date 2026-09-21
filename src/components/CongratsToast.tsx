import { Check, Gift, MessageCircle, Users } from 'lucide-react'
import { useVuna } from '../store/VunaContext'

export function CongratsToast() {
  const { notice, dismissNotice, setTab, setPulseTab } = useVuna()
  if (!notice) return null

  const giftLike =
    notice.kind === 'gift_in' || notice.kind === 'gift_sent' || notice.kind === 'gift_reply'
  const tribeLike = notice.kind === 'tribe'
  const wrapLike = notice.kind === 'wrap'
  const Icon = tribeLike
    ? Users
    : notice.kind === 'gift_reply'
      ? MessageCircle
      : giftLike
        ? Gift
        : Check

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[95] flex justify-center px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <button
        type="button"
        onClick={() => {
          dismissNotice()
          if (giftLike) {
            setTab('pulse')
            setPulseTab('feed')
          } else if (tribeLike || wrapLike) {
            setTab('profile')
          }
        }}
        className="pointer-events-auto flex w-full max-w-[430px] items-start gap-3 rounded-[22px] border border-[#3d4f00] bg-[#1a2408] px-4 py-3 text-left shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
        aria-live="polite"
      >
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-vuna-lime text-black">
          <Icon size={18} strokeWidth={2.5} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold text-vuna-lime">{notice.title}</span>
          <span className="mt-0.5 block text-[13px] leading-snug text-white">{notice.body}</span>
        </span>
      </button>
    </div>
  )
}
