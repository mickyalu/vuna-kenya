import { FACE_PHOTOS } from '../lib/avatars'
import { TRIBES, type Tribe } from '../lib/tribes'
import { PersonAvatar } from './PersonAvatar'

export function TribeChip({
  tribe,
  onClick,
  youUrl,
  youName,
  compact = false,
}: {
  tribe: Tribe
  onClick: () => void
  youUrl?: string
  youName?: string
  compact?: boolean
}) {
  const faces = [
    youUrl
      ? { src: youUrl, alt: youName || 'You' }
      : null,
    ...tribe.members.map((m) => ({ src: m.photo, alt: m.name })),
  ].filter(Boolean) as { src: string; alt: string }[]

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        compact
          ? 'flex items-center gap-2 rounded-full border border-vuna-border bg-vuna-raised py-1 pl-1 pr-3'
          : 'rounded-[22px] border border-vuna-border bg-vuna-raised px-3 py-2 text-left'
      }
    >
      <AvatarStack faces={faces} size={compact ? 28 : 36} />
      <p
        className={
          compact
            ? 'text-[12px] font-semibold text-white'
            : 'mt-1.5 text-center text-[13px] font-semibold tracking-wide text-white'
        }
      >
        {tribe.name}
      </p>
    </button>
  )
}

export function AvatarStack({
  faces,
  size = 36,
}: {
  faces: { src: string; alt: string }[]
  size?: number
}) {
  return (
    <div className="flex justify-center pl-2">
      {faces.slice(0, 4).map((face, i) => (
        <span
          key={`${face.alt}-${i}`}
          className="relative -ml-2 rounded-full border-2 border-[#121212]"
          style={{ zIndex: 4 - i }}
        >
          <PersonAvatar src={face.src} alt={face.alt} size={size} />
        </span>
      ))}
    </div>
  )
}

export function tribeFace(name: keyof typeof FACE_PHOTOS) {
  return FACE_PHOTOS[name]
}
