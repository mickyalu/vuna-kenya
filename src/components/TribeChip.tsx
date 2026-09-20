import { TRIBES, type Tribe } from '../lib/tribes'

export function TribeChip({
  tribe,
  onClick,
}: {
  tribe: Tribe
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[22px] border border-vuna-border bg-vuna-raised px-4 py-3 text-left"
    >
      <AvatarStack members={tribe.members} />
      <p className="mt-2 text-center text-[13px] font-semibold tracking-wide text-white">
        {tribe.name}
      </p>
    </button>
  )
}

export function AvatarStack({
  members,
}: {
  members: Tribe['members']
}) {
  return (
    <div className="flex justify-center pl-2">
      {members.slice(0, 4).map((member, i) => (
        <span
          key={`${member.initials}-${i}`}
          className="relative -ml-2 flex h-9 w-9 items-center justify-center rounded-full border-[2px] border-[#1a1a1a] text-[10px] font-bold text-white"
          style={{ background: member.tone, zIndex: 4 - i }}
        >
          {member.initials}
        </span>
      ))}
    </div>
  )
}
