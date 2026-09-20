import { X } from 'lucide-react'
import { useVuna } from '../store/VunaContext'

export function LogSheet() {
  const {
    logDraft,
    closeLog,
    setLogMessage,
    setLogVisibility,
    publishLog,
    lines,
  } = useVuna()

  if (!logDraft.open || !logDraft.lineId) return null
  const line = lines.find((item) => item.id === logDraft.lineId)
  if (!line) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center">
      <button type="button" className="absolute inset-0 bg-black/65" onClick={closeLog} aria-label="Not now" />
      <div className="relative z-10 w-full max-w-[430px] rounded-t-[28px] border-t border-vuna-border bg-[#121212] px-5 pb-6 pt-5">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">LOG A VUNA</p>
            <h2 className="mt-1 text-[20px] font-bold text-white">{line.description}</h2>
          </div>
          <button
            type="button"
            onClick={closeLog}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-vuna-raised text-vuna-muted"
            aria-label="Not now"
          >
            <X size={16} />
          </button>
        </div>
        <p className="mb-3 text-[13px] text-vuna-muted">
          Optional note. Skip it if you just want the tribe to see that you showed up.
        </p>
        <textarea
          value={logDraft.message}
          onChange={(e) => setLogMessage(e.target.value)}
          placeholder="How did it feel? (optional)"
          rows={3}
          className="w-full resize-none rounded-2xl border border-vuna-border bg-vuna-raised px-3 py-3 text-[14px] text-white outline-none placeholder:text-vuna-dim"
        />
        <div className="mt-4 flex rounded-full bg-vuna-raised p-1">
          <button
            type="button"
            onClick={() => setLogVisibility('public')}
            className={`flex-1 rounded-full py-2 text-[13px] font-semibold ${
              logDraft.visibility === 'public' ? 'bg-vuna-lime text-black' : 'text-vuna-muted'
            }`}
          >
            Public
          </button>
          <button
            type="button"
            onClick={() => setLogVisibility('friends')}
            className={`flex-1 rounded-full py-2 text-[13px] font-semibold ${
              logDraft.visibility === 'friends' ? 'bg-vuna-lime text-black' : 'text-vuna-muted'
            }`}
          >
            Friends
          </button>
        </div>
        <button
          type="button"
          onClick={publishLog}
          className="mt-5 w-full rounded-full bg-vuna-lime py-3 text-[15px] font-semibold text-black"
        >
          Share to Pulse
        </button>
        <button type="button" onClick={closeLog} className="mt-2 w-full py-3 text-[14px] text-vuna-muted">
          Not now — keep it locked
        </button>
      </div>
    </div>
  )
}
