export type AvatarChoice = {
  id: string
  url: string
  label: string
}

export const AVATAR_CHOICES: AvatarChoice[] = [
  { id: 'otieno', label: 'Otieno', url: '/faces/otieno.jpg' },
  { id: 'awa', label: 'Awa', url: '/faces/awa.jpg' },
  { id: 'mkuu', label: 'Mkuu', url: '/faces/mkuu.jpg' },
  { id: 'zuri', label: 'Zuri', url: '/faces/zuri.jpg' },
  { id: 'kito', label: 'Kito', url: '/faces/kito.jpg' },
  { id: 'leila', label: 'Leila', url: '/faces/leila.jpg' },
  { id: 'nuru', label: 'Nuru', url: '/faces/nuru.jpg' },
  { id: 'amina', label: 'Amina', url: '/faces/amina.jpg' },
]

export const DEFAULT_AVATAR_ID = 'otieno'

export function avatarUrlById(id: string): string {
  return AVATAR_CHOICES.find((a) => a.id === id)?.url ?? AVATAR_CHOICES[0].url
}

export function cardholderName(firstName: string, lastInitial: string) {
  const raw = firstName.trim() || 'Michael'
  const first = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
  const initial = (lastInitial.trim().charAt(0) || 'A').toUpperCase()
  return `${first}.${initial}`
}

export type ProfileDraft = {
  firstName: string
  lastInitial: string
  avatarId: string
}

export type ProfileDraftResult =
  | { ok: true; firstName: string; lastInitial: string; avatarId: string; cardName: string }
  | { ok: false; error: string }

export function parseProfileDraft(input: ProfileDraft): ProfileDraftResult {
  const first = input.firstName.replace(/[^a-zA-Z '.-]/g, '').trim().slice(0, 18)
  const initial = input.lastInitial.replace(/[^a-zA-Z]/g, '').slice(0, 1).toUpperCase()
  if (!first) return { ok: false, error: 'Add a first name for the card.' }
  if (!initial) return { ok: false, error: 'Add a last initial.' }
  if (!AVATAR_CHOICES.some((a) => a.id === input.avatarId)) {
    return { ok: false, error: 'Pick a card photo.' }
  }
  const titled = first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()
  return {
    ok: true,
    firstName: titled,
    lastInitial: initial,
    avatarId: input.avatarId,
    cardName: cardholderName(titled, initial),
  }
}

export const FACE_PHOTOS: Record<string, string> = {
  Mkuu: '/faces/mkuu.jpg',
  Nzomo: '/faces/otieno.jpg',
  Awino: '/faces/awa.jpg',
  Sam: '/faces/zuri.jpg',
  Leila: '/faces/leila.jpg',
  Joe: '/faces/joe.jpg',
  Ken: '/faces/ken.jpg',
}

export function monthLabel(now = new Date()) {
  return now.toLocaleString('en-KE', { month: 'long', year: 'numeric' })
}
