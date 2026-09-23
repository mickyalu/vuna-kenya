import { FACE_PHOTOS } from '../lib/avatars'
import { type Tribe } from '../lib/tribes'
import { PersonAvatar } from './PersonAvatar'

export function TribeChip({
  tribe,
  onClick,
  youUrl,
  youName,
  people,
  compact = false,
  label,
}: {
  tribe: Tribe
  onClick: () => void
  youUrl?: string
  youName?: string
  people?: { src: string; alt: string }[]
  compact?: boolean
  label?: string
}) {
  const faces = people
    ? people.filter((face) => face.src && face.alt)
    : ([
        youUrl ? { src: youUrl, alt: youName || 'You' } : null,
        ...tribe.members.map((member) => ({ src: member.photo, alt: member.name })),
      ].filter(Boolean) as { src: string; alt: string }[])

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label ? `${label}, ${tribe.name}. Open tribes on Profile.` : tribe.name}
      className={
        compact
          ? `flex items-center gap-2 rounded-full border border-vuna-border bg-vuna-raised py-1 pr-3 ${faces.length ? 'pl-1' : 'pl-3'}`
          : 'rounded-[22px] border border-vuna-border bg-vuna-raised px-3 py-2 text-left'
      }
    >
      {faces.length ? <AvatarStack faces={faces} size={compact ? 28 : 36} /> : null}
      <span className={compact ? 'text-left' : 'mt-1.5 block text-center'}>
        {label ? (
          <span className="block text-[9px] font-semibold tracking-[0.12em] text-vuna-dim">
            {label.toUpperCase()}
          </span>
        ) : null}
        <span
          className={
            compact
              ? 'block text-[12px] font-semibold text-white'
              : 'block text-[13px] font-semibold tracking-wide text-white'
          }
        >
          {tribe.name}
        </span>
      </span>
    </button>
  )
}

export function AvatarStack({
  faces,
  size = 36,
  className = 'justify-center',
}: {
  faces: { src: string; alt: string }[]
  size?: number
  className?: string
}) {
  return (
    <div className={`flex pl-2 ${className}`}>
      {faces.slice(0, 4).map((face, i) => (
        <span
          key={`${face.alt}-${i}`}
          className="relative -ml-2 rounded-full ring-2 ring-[#0A0A0A]"
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
