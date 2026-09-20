import { Gift, Heart } from 'lucide-react'
import { monthLabel } from '../lib/avatars'
import { TRIBES } from '../lib/tribes'
import { useVuna } from '../store/VunaContext'
import { PersonAvatar } from './PersonAvatar'
import { TribeChip } from './TribeChip'

function timeLabel(minutesAgo: number) {
  if (minutesAgo < 1) return 'now'
  if (minutesAgo < 60) return `${minutesAgo}m ago`
  const hours = Math.round(minutesAgo / 60)
  return `${hours}h ago`
}

export function PulseTab() {
  const {
    pulseTab,
    setPulseTab,
    feed,
    salute,
    gift,
    giftNotice,
    liveFriends,
    leaders,
    activeTribePillar,
    openTribes,
    avatarUrl,
    firstName,
    monthlyVunas,
  } = useVuna()

  const tribe = TRIBES[activeTribePillar]

  return (
    <div className="space-y-5 pb-4">
      <header>
        <p className="text-[11px] font-semibold tracking-[0.18em] text-vuna-muted">
          SOCIAL TRIBES
        </p>
        <h1 className="font-display mt-1 text-[52px] leading-[0.9] text-white">PULSE</h1>
      </header>

      <div className="flex items-center justify-between gap-3">
        <TribeChip
          tribe={tribe}
          onClick={openTribes}
          youUrl={avatarUrl}
          youName={firstName}
        />
        <p className="min-w-0 flex-1 text-[12px] leading-snug text-vuna-muted">
          {tribe.line} Tap the circle to sit with them.
        </p>
      </div>

      <div className="flex rounded-full bg-vuna-raised p-1">
        <button
          type="button"
          onClick={() => setPulseTab('feed')}
          className={`flex-1 rounded-full py-2.5 text-[14px] font-semibold ${
            pulseTab === 'feed'
              ? 'bg-vuna-lime text-black'
              : 'bg-transparent text-vuna-muted'
          }`}
        >
          Activity Feed
        </button>
        <button
          type="button"
          onClick={() => setPulseTab('leaderboard')}
          className={`flex-1 rounded-full py-2.5 text-[14px] font-semibold ${
            pulseTab === 'leaderboard'
              ? 'bg-vuna-lime text-black'
              : 'bg-transparent text-vuna-muted'
          }`}
        >
          Leaderboard
        </button>
      </div>

      <div className="rounded-2xl border border-vuna-border bg-vuna-card px-4 py-3">
        <p className="flex items-start gap-2 text-[13px] leading-snug text-vuna-mint">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-vuna-mint" />
          Live: {liveFriends} of your friends are active in {tribe.name}
        </p>
      </div>

      {giftNotice ? (
        <p className="rounded-xl border border-vuna-border bg-vuna-raised px-3 py-2 text-[12px] text-vuna-lime">
          {giftNotice}
        </p>
      ) : null}

      {pulseTab === 'feed' ? (
        <section>
          <h2 className="mb-3 text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">
            VERIFIED PROTOCOL WINS
          </h2>
          <div className="space-y-3">
            {feed.length === 0 ? (
              <p className="rounded-2xl border border-vuna-border bg-vuna-card px-4 py-8 text-center text-[13px] text-vuna-muted">
                No verified wins yet. Lock a habit from Harvest to post here.
              </p>
            ) : (
              feed.map((post) => (
                <article
                  key={post.id}
                  className="rounded-2xl border border-vuna-border bg-vuna-card p-4"
                >
                  <div className="flex items-start gap-3">
                    <PersonAvatar src={post.avatar} alt={post.handle} size={44} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="flex min-w-0 items-center gap-1.5 text-[14px] font-bold text-white">
                          <span className="truncate">{post.handle}</span>
                          <span className="h-2 w-2 shrink-0 rounded-full bg-vuna-lime" />
                        </p>
                        <p className="shrink-0 text-[11px] text-vuna-dim">
                          {timeLabel(post.minutesAgo)}
                        </p>
                      </div>
                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        <p className="truncate text-[12px] text-vuna-muted">
                          {post.tribe}
                          {post.visibility === 'friends' ? ' · Friends' : ''}
                        </p>
                        <span className="shrink-0 rounded-full bg-[#2a2400] px-2.5 py-1 text-[11px] font-semibold text-vuna-lime">
                          🔥 {post.streak} Day Streak
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-[14px] leading-snug text-white">{post.text}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => salute(post.id)}
                      className={`flex items-center justify-center gap-2 rounded-full border py-2.5 text-[13px] font-medium ${
                        post.saluted
                          ? 'border-vuna-lime text-vuna-lime'
                          : 'border-vuna-border text-white'
                      }`}
                    >
                      <Heart
                        size={16}
                        fill={post.saluted ? '#CCFF00' : 'none'}
                        className={post.saluted ? 'text-vuna-lime' : 'text-white'}
                      />
                      Salute ({post.salutes})
                    </button>
                    <button
                      type="button"
                      onClick={() => gift(post.id)}
                      className="flex items-center justify-center gap-2 rounded-full bg-vuna-lime py-2.5 text-[13px] font-semibold text-black"
                    >
                      <Gift size={16} />
                      Vuna Gift
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      ) : (
        <section>
          <h2 className="mb-1 text-[11px] font-semibold tracking-[0.16em] text-vuna-muted">
            THIS MONTH · {monthLabel().toUpperCase()}
          </h2>
          <p className="mb-3 text-[12px] text-vuna-muted">
            Ranked by vunas — how many times someone locked a habit this month. Not KES.
          </p>
          <div className="space-y-2">
            {[
              {
                handle: `@${firstName.toUpperCase()}`,
                tribe: 'You',
                avatar: avatarUrl,
                kes: 0,
                streak: monthlyVunas,
              },
              ...leaders,
            ]
              .sort((a, b) => b.streak - a.streak)
              .map((row, index) => (
              <article
                key={row.handle}
                className="flex items-center gap-3 rounded-2xl border border-vuna-border bg-vuna-card px-3 py-3"
              >
                <span className="w-6 text-center text-[13px] font-semibold text-vuna-muted">
                  {index + 1}
                </span>
                <PersonAvatar src={row.avatar} alt={row.handle} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-white">{row.handle}</p>
                  <p className="text-[12px] text-vuna-muted">{row.tribe}</p>
                </div>
                <div className="text-right">
                  <p className="font-amount text-[20px] leading-none text-vuna-lime">{row.streak}</p>
                  <p className="mt-1 text-[9px] font-semibold tracking-[0.14em] text-vuna-dim">
                    VUNAS
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
