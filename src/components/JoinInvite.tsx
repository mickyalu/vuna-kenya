import { useVuna } from '../store/VunaContext'
import { AvatarStack } from './TribeChip'

export function JoinInvite() {
  const { pendingInvite, acceptInvite, dismissInvite } = useVuna()
  if (!pendingInvite) return null

  const club = pendingInvite.club
  const people = club
    ? club.live === 1
      ? '1 person is already there.'
      : `${club.live} people are already there.`
    : ''
  const faces = club
    ? club.members.map((member) => ({ src: member.photo, alt: member.name }))
    : []

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-[#0A0A0A] sm:items-center">
      <main className="w-full max-w-[430px] px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-16">
        {club ? (
          <>
            <p className="text-[12px] font-semibold tracking-[0.16em] text-vuna-lime">VUNA · A SEAT IS OPEN</p>
            <h1 className="mt-3 font-display text-[72px] leading-[0.9] text-white">{club.name}</h1>
            {club.vertical ? <p className="mt-3 text-[16px] font-semibold text-white">{club.vertical}</p> : null}
            <p className="mt-4 text-[16px] leading-snug text-[#bdbdbd]">{club.line}</p>
            <p className="mt-2 text-[16px] leading-snug text-[#bdbdbd]">{people}</p>
            {pendingInvite.ref ? (
              <p className="mt-3 text-[16px] font-semibold text-white">{pendingInvite.ref} kept you a seat.</p>
            ) : null}
            {faces.length ? (
              <div className="mt-5">
                <AvatarStack faces={faces} size={36} className="justify-start" />
              </div>
            ) : null}
            <button
              type="button"
              onClick={acceptInvite}
              className="mt-8 w-full rounded-full bg-vuna-lime py-4 text-[18px] font-semibold text-black"
            >
              Join {club.name}
            </button>
            <p className="mt-3 text-center text-[13px] text-vuna-muted">One tap. You sit with them on Harvest.</p>
            <button
              type="button"
              onClick={dismissInvite}
              className="mt-4 w-full py-2 text-[13px] font-semibold text-vuna-muted"
            >
              Not now
            </button>
          </>
        ) : (
          <>
            <p className="text-[12px] font-semibold tracking-[0.16em] text-vuna-lime">VUNA</p>
            <h1 className="mt-3 font-display text-[56px] leading-[0.9] text-white">This seat is not open.</h1>
            <p className="mt-4 text-[16px] leading-snug text-[#bdbdbd]">Ask for a fresh invite from the tribe.</p>
            <button
              type="button"
              onClick={dismissInvite}
              className="mt-8 w-full rounded-full bg-vuna-lime py-4 text-[18px] font-semibold text-black"
            >
              Back to Harvest
            </button>
          </>
        )}
      </main>
    </div>
  )
}
