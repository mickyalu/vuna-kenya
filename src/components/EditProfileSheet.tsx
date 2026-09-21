import { useState } from 'react'
import { X } from 'lucide-react'
import { AVATAR_CHOICES, avatarUrlById, cardholderName } from '../lib/avatars'
import { useVuna } from '../store/VunaContext'
import { PersonAvatar } from './PersonAvatar'

export function EditProfileSheet() {
  const {
    closeProfileEdit,
    firstName,
    lastInitial,
    avatarId,
    saveProfile,
  } = useVuna()

  const [draftFirst, setDraftFirst] = useState(firstName)
  const [draftInitial, setDraftInitial] = useState(lastInitial)
  const [draftAvatar, setDraftAvatar] = useState(avatarId)
  const [error, setError] = useState<string | null>(null)

  const previewName = cardholderName(draftFirst, draftInitial)
  const previewUrl = avatarUrlById(draftAvatar)

  function onSave() {
    const result = saveProfile({
      firstName: draftFirst,
      lastInitial: draftInitial,
      avatarId: draftAvatar,
    })
    if (!result.ok) setError(result.error)
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        onClick={closeProfileEdit}
        aria-label="Close edit profile"
      />
      <div className="relative z-10 max-h-[88svh] w-full max-w-[430px] overflow-y-auto rounded-t-[28px] border-t border-vuna-border bg-[#121212] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">
              THE REPUTATION
            </p>
            <h2 className="mt-1 text-[22px] font-bold text-white">Edit profile</h2>
          </div>
          <button
            type="button"
            onClick={closeProfileEdit}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-vuna-raised text-vuna-muted"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mb-5 flex items-center gap-3 rounded-[22px] border border-[#3d4f00] bg-[#141a08] px-4 py-3">
          <PersonAvatar src={previewUrl} alt={previewName} size={56} />
          <div className="min-w-0">
            <p className="text-[18px] font-semibold tracking-tight text-white">{previewName}</p>
            <p className="text-[12px] text-vuna-muted">On the card as {previewName}</p>
          </div>
        </div>

        <label className="mb-3 block">
          <span className="text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">
            FIRST NAME
          </span>
          <input
            value={draftFirst}
            onChange={(e) => {
              setDraftFirst(e.target.value)
              setError(null)
            }}
            autoComplete="given-name"
            maxLength={18}
            aria-label="First name"
            className="mt-1 w-full rounded-2xl border border-vuna-border bg-vuna-raised px-4 py-3 text-[16px] text-white outline-none placeholder:text-vuna-dim"
            placeholder="Amina"
          />
        </label>

        <label className="mb-4 block">
          <span className="text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">
            LAST INITIAL
          </span>
          <input
            value={draftInitial}
            onChange={(e) => {
              setDraftInitial(e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 1).toUpperCase())
              setError(null)
            }}
            maxLength={1}
            autoComplete="off"
            aria-label="Last initial"
            className="mt-1 w-16 rounded-2xl border border-vuna-border bg-vuna-raised px-4 py-3 text-center text-[18px] font-semibold uppercase text-white outline-none"
            placeholder="K"
          />
        </label>

        <p className="mb-2 text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">
          CARD PHOTO
        </p>
        <div className="mb-4 grid grid-cols-4 gap-2">
          {AVATAR_CHOICES.map((face) => {
            const selected = face.id === draftAvatar
            return (
              <button
                key={face.id}
                type="button"
                onClick={() => {
                  setDraftAvatar(face.id)
                  setError(null)
                }}
                aria-label={`Use ${face.label} photo`}
                aria-pressed={selected}
                className={`flex flex-col items-center gap-1 rounded-2xl p-1.5 ${
                  selected ? 'bg-[#1f2a00] ring-2 ring-vuna-lime' : 'bg-vuna-raised'
                }`}
              >
                <PersonAvatar src={face.url} alt={face.label} size={56} />
                <span className="text-[10px] font-medium text-vuna-muted">{face.label}</span>
              </button>
            )
          })}
        </div>

        {error ? (
          <p className="mb-3 text-[13px] text-[#f07167]" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={onSave}
          className="mb-2 w-full rounded-full bg-vuna-lime py-3.5 text-[15px] font-semibold text-black"
        >
          Save profile
        </button>
        <button
          type="button"
          onClick={closeProfileEdit}
          className="mb-2 w-full rounded-full bg-vuna-raised py-3 text-[14px] font-semibold text-vuna-muted"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
