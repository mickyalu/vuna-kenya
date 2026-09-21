import { FACE_PHOTOS } from './avatars'
import type { PillarId } from './pillars'

export type TribeMember = {
  initials: string
  tone: string
  name: string
  photo: string
}

export type Tribe = {
  pillar: PillarId
  name: string
  live: number
  line: string
  members: TribeMember[]
}

export type Club = Tribe & {
  id: string
  inviteSlug: string
  createdByYou?: boolean
}

function mate(name: keyof typeof FACE_PHOTOS, initials: string, tone: string): TribeMember {
  return { name, initials, tone, photo: FACE_PHOTOS[name] }
}

export const ACTIVITIES: Record<PillarId, string[]> = {
  FITNESS: ['Morning Run', 'Gym Session', 'Yoga', 'Swimming'],
  HEALTH: ['Health Checkup', 'Vitamins', 'Meditation', 'Sleep 8hrs'],
  HABITS: ['5am Wake Up', 'Journaling', 'No Phone Hour', 'Cold Shower'],
  LIFESTYLE: ['Meal Prep', 'Budget Review', 'Family Time', 'Learning'],
  RELATIONSHIP: ['Call Home', 'Date Night', 'Check In', 'Quality Time'],
  FINANCES: ['M-Pesa Save', 'Budget Review', 'Debt Payment', 'Give'],
  CAREER: ['Deep Work', 'Client Follow-up', 'Skill Drill', 'Ship Work'],
  FAITH: ['Morning Prayer', 'Scripture', 'Fellowship', 'Sabbath'],
  LEARNING: ['Reading', 'Language Practice', 'Course Module', 'Revision'],
  COMMUNITY: ['Show Up', 'Volunteer', 'Check a Friend', 'Host'],
  REST: ['Wind Down', 'No Screens', 'Walk Outside', 'Sleep Early'],
  NUTRITION: ['Cook at Home', 'Water Goal', 'Protein Plate', 'No Sugar'],
}

export const TRIBES: Record<PillarId, Tribe> = {
  FITNESS: {
    pillar: 'FITNESS',
    name: '5AM Club',
    live: 3,
    line: 'Karura before the city wakes.',
    members: [
      mate('Mkuu', 'MK', '#6b4f3a'),
      mate('Nzomo', 'NZ', '#2f3a44'),
      mate('Awino', 'AW', '#c4a574'),
      mate('Sam', 'SA', '#8a6a55'),
    ],
  },
  HEALTH: {
    pillar: 'HEALTH',
    name: 'Mindful Morning',
    live: 2,
    line: 'Stillness before the matatu crush.',
    members: [
      mate('Sam', 'SA', '#8a6a55'),
      mate('Leila', 'LV', '#4a5560'),
      mate('Joe', 'JO', '#3d4a3a'),
    ],
  },
  HABITS: {
    pillar: 'HABITS',
    name: 'Daily Lock',
    live: 4,
    line: 'Tiny promises, kept in KES.',
    members: [
      mate('Mkuu', 'MK', '#6b4f3a'),
      mate('Sam', 'SA', '#8a6a55'),
      mate('Ken', 'KE', '#5c4a38'),
    ],
  },
  LIFESTYLE: {
    pillar: 'LIFESTYLE',
    name: 'Westlands Circle',
    live: 2,
    line: 'Home rhythm over hustle theatre.',
    members: [
      mate('Awino', 'AW', '#c4a574'),
      mate('Leila', 'LV', '#4a5560'),
      mate('Nzomo', 'NZ', '#2f3a44'),
    ],
  },
  RELATIONSHIP: {
    pillar: 'RELATIONSHIP',
    name: 'Keepers',
    live: 1,
    line: 'The people who still pick up.',
    members: [mate('Leila', 'LV', '#4a5560'), mate('Awino', 'AW', '#c4a574')],
  },
  FINANCES: {
    pillar: 'FINANCES',
    name: 'KES Rail',
    live: 3,
    line: 'Save it before it leaves the simu.',
    members: [
      mate('Mkuu', 'MK', '#6b4f3a'),
      mate('Ken', 'KE', '#5c4a38'),
      mate('Joe', 'JO', '#3d4a3a'),
    ],
  },
  CAREER: {
    pillar: 'CAREER',
    name: 'Deep Bench',
    live: 1,
    line: 'Craft when nobody is watching.',
    members: [mate('Nzomo', 'NZ', '#2f3a44'), mate('Sam', 'SA', '#8a6a55')],
  },
  FAITH: {
    pillar: 'FAITH',
    name: 'First Light',
    live: 2,
    line: 'Before the noise, a word.',
    members: [mate('Awino', 'AW', '#c4a574'), mate('Joe', 'JO', '#3d4a3a')],
  },
  LEARNING: {
    pillar: 'LEARNING',
    name: 'Page Turners',
    live: 1,
    line: 'One page is still a harvest.',
    members: [mate('Sam', 'SA', '#8a6a55'), mate('Leila', 'LV', '#4a5560')],
  },
  COMMUNITY: {
    pillar: 'COMMUNITY',
    name: 'Show Ups',
    live: 2,
    line: 'Presence is the gift.',
    members: [mate('Mkuu', 'MK', '#6b4f3a'), mate('Awino', 'AW', '#c4a574')],
  },
  REST: {
    pillar: 'REST',
    name: 'Sabbath Set',
    live: 1,
    line: 'Stop so the work can root.',
    members: [mate('Leila', 'LV', '#4a5560'), mate('Joe', 'JO', '#3d4a3a')],
  },
  NUTRITION: {
    pillar: 'NUTRITION',
    name: 'Cooks at Home',
    live: 2,
    line: 'The plate you can name.',
    members: [mate('Awino', 'AW', '#c4a574'), mate('Ken', 'KE', '#5c4a38')],
  },
}

export function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'tribe'
}

export function uniqueInviteSlug(name: string, taken: Iterable<string>) {
  const used = new Set(taken)
  const base = slugify(name)
  if (!used.has(base)) return base
  let n = 2
  while (used.has(`${base}-${n}`)) n += 1
  return `${base}-${n}`
}

export function clubFromTribe(tribe: Tribe, id: string = tribe.pillar): Club {
  return {
    ...tribe,
    id,
    inviteSlug: slugify(tribe.name),
  }
}

export const CATALOG_CLUBS: Club[] = (Object.keys(TRIBES) as PillarId[]).map((id) =>
  clubFromTribe(TRIBES[id], id),
)

export function inviteUrl(club: Club) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://vuna.app'
  return `${origin}/app?join=${encodeURIComponent(club.inviteSlug)}`
}

export async function shareInvite(club: Club) {
  const url = inviteUrl(club)
  const text = `Join ${club.name} on VUNA — we lock KES against habits.`
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: `${club.name} on VUNA`, text, url })
      return { url, shared: true as const }
    } catch {
      /* cancelled or unsupported */
    }
  }
  try {
    await navigator.clipboard?.writeText(url)
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined') {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      '_blank',
      'noopener,noreferrer',
    )
  }
  return { url, shared: false as const }
}
