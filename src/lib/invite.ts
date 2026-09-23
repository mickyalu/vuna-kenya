export const INVITE_REWARD_KES = 100

export type InviteClub = {
  name: string
  line: string
  live: number
  inviteSlug: string
}

export function inviteMessage(club: Pick<InviteClub, 'name' | 'line' | 'live'>, fromName?: string | null) {
  const seat = fromName?.trim()
    ? `${fromName.trim()} kept you a seat in ${club.name}.`
    : `A seat is open in ${club.name}.`
  const people = club.live === 1 ? '1 person is already there.' : `${club.live} people are already there.`
  return `${seat}\n${club.line} ${people}\nCome lock one habit with us.`
}

export function inviteLink(origin: string, slug: string, fromName?: string | null) {
  const url = new URL(`/join/${encodeURIComponent(slug)}`, origin)
  const ref = fromName?.trim()
  if (ref) url.searchParams.set('ref', ref)
  return url.toString()
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function renderJoinPage(input: {
  origin: string
  slug: string
  club: InviteClub | null
  ref: string | null
}) {
  const origin = input.origin.replace(/\/$/, '')
  const image = `${origin}/og/vuna-invite.png`
  const ref = input.ref?.trim() || ''
  const club = input.club
  const people = club
    ? club.live === 1
      ? '1 person is already there.'
      : `${club.live} people are already there.`
    : ''
  const title = club ? `Sit with ${club.name}` : 'A seat on VUNA'
  const description = club ? `${club.line} ${people}` : 'Come lock one habit with a VUNA tribe.'
  const canonical = inviteLink(origin, input.slug, ref || null)
  const appUrl = new URL('/app', origin)
  appUrl.searchParams.set('join', input.slug)
  if (ref) appUrl.searchParams.set('ref', ref)
  appUrl.searchParams.set('ready', '1')
  const body = club
    ? `<p class="eyebrow">VUNA · A SEAT IS OPEN</p>
       <h1>${escapeHtml(club.name)}</h1>
       <p class="line">${escapeHtml(club.line)}</p>
       <p class="proof">${escapeHtml(people)}</p>
       ${ref ? `<p class="from">${escapeHtml(ref)} kept you a seat.</p>` : ''}
       <a class="cta" href="${escapeHtml(appUrl.toString())}">Join ${escapeHtml(club.name)}</a>
       <p class="next">One tap. You sit with them on Harvest.</p>`
    : `<p class="eyebrow">VUNA</p>
       <h1>This seat is not open.</h1>
       <p class="line">Ask for a fresh invite from the tribe.</p>
       <a class="cta" href="${escapeHtml(origin)}">Back to VUNA</a>`
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta property="og:site_name" content="VUNA" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:image:secure_url" content="${escapeHtml(image)}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="VUNA. A seat is open. Come lock one habit with the tribe." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@500;700&display=swap" rel="stylesheet" />
  <style>
    body { margin: 0; min-height: 100vh; background: #0A0A0A; color: #fff; font-family: Outfit, sans-serif; display: flex; align-items: center; justify-content: center; padding: 32px 20px; }
    main { width: min(420px, 100%); }
    .eyebrow { letter-spacing: 0.16em; font-size: 12px; font-weight: 700; color: #CCFF00; }
    h1 { font-family: 'Bebas Neue', sans-serif; font-size: 72px; line-height: 0.9; margin: 12px 0; font-weight: 400; }
    .line, .proof, .from, .next { color: #bdbdbd; font-size: 16px; line-height: 1.45; }
    .from { color: #fff; }
    .cta { display: block; margin-top: 28px; background: #CCFF00; color: #111; text-align: center; text-decoration: none; font-weight: 700; border-radius: 999px; padding: 16px 20px; font-size: 18px; }
    .next { margin-top: 14px; font-size: 13px; }
  </style>
</head>
<body>
  <main>${body}</main>
</body>
</html>`
}
