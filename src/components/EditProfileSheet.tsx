import { useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'
import { AVATAR_CHOICES, resolveAvatarUrl, UPLOAD_AVATAR_ID, cardholderName } from '../lib/avatars'
import { readCardPhoto } from '../lib/card-photo'
import { useVuna } from '../store/VunaContext'
import { PersonAvatar } from './PersonAvatar'

export function EditProfileSheet() {
  const {
    closeProfileEdit,
    firstName,
    lastInitial,
    avatarId,
    uploadedPhoto,
    saveProfile,
  } = useVuna()

  const fileRef = useRef<HTMLInputElement>(null)
  const [draftFirst, setDraftFirst] = useState(firstName)
  const [draftInitial, setDraftInitial] = useState(lastInitial)
  const [draftAvatar, setDraftAvatar] = useState(avatarId)
  const [draftPhoto, setDraftPhoto] = useState(uploadedPhoto)
  const [error, setError] = useState<string | null>(null)

  const previewName = cardholderName(draftFirst, draftInitial)
  const previewUrl = resolveAvatarUrl(draftAvatar, draftPhoto)
  const usingUpload = draftAvatar === UPLOAD_AVATAR_ID && Boolean(draftPhoto)

  async function onPick(file: File) {
    try {
      const url = await readCardPhoto(file)
      setDraftPhoto(url)
      setDraftAvatar(UPLOAD_AVATAR_ID)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Choose a JPEG or PNG.')
    }
  }

  function onSave() {
    const result = saveProfile({
      firstName: draftFirst,
      lastInitial: draftInitial,
      avatarId: draftAvatar,
      photo: draftPhoto,
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
          <PersonAvatar
            src={previewUrl}
            alt={previewName || 'You'}
            size={56}
            objectPosition={usingUpload ? 'center' : 'center 18%'}
          />
          <div className="min-w-0">
            <p className="text-[18px] font-semibold tracking-tight text-white">{previewName ?? 'Your name'}</p>
            <p className="text-[12px] text-vuna-muted">
              {previewName ? `On the card as ${previewName}` : 'Save to put your name on the card.'}
            </p>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-[1fr_4.75rem] gap-3">
          <label className="block">
            <span className="block text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">
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
          <label className="block">
            <span className="block text-[11px] font-semibold tracking-[0.12em] text-vuna-muted">
              INITIAL
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
              className="mt-1 w-full rounded-2xl border border-vuna-border bg-vuna-raised py-3 text-center text-[18px] font-semibold uppercase text-white outline-none"
              placeholder="K"
            />
          </label>
        </div>

        <p className="mb-2 text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">
          YOUR PHOTO
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          aria-label="Upload a photo"
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (file) void onPick(file)
          }}
        />
        <button
          type="button"
          onClick={() => {
            if (draftPhoto) setDraftAvatar(UPLOAD_AVATAR_ID)
            fileRef.current?.click()
          }}
          aria-pressed={usingUpload}
          className={`mb-4 flex w-full items-center gap-3 rounded-2xl p-3 text-left ${
            usingUpload ? 'bg-[#1f2a00] ring-2 ring-vuna-lime' : 'bg-vuna-raised'
          }`}
        >
          {draftPhoto ? (
            <PersonAvatar src={draftPhoto} alt="Your photo" size={56} objectPosition="center" />
          ) : (
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#1a1a1a] text-vuna-lime ring-2 ring-[#CCFF00]">
              <Camera size={22} />
            </span>
          )}
          <span className="min-w-0">
            <span className="block text-[15px] font-semibold text-white">
              {draftPhoto ? 'Your photo' : 'Upload a photo'}
            </span>
            <span className="block text-[12px] text-vuna-muted">
              {draftPhoto ? 'Tap to replace it.' : 'Use a picture from this phone.'}
            </span>
          </span>
        </button>

        <p className="mb-2 text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">
          AVATARS
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
                aria-label={`Use ${face.label} avatar`}
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
