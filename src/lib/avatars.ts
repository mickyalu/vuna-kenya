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
export const UPLOAD_AVATAR_ID = 'upload'
const MAX_PHOTO_CHARS = 180_000

export function isUploadedPhoto(value: string | null | undefined): value is string {
  if (!value) return false
  return /^data:image\/(jpeg|png|webp);base64,[a-z0-9+/=\s]+$/i.test(value) && value.length <= MAX_PHOTO_CHARS
}

export function avatarUrlById(id: string): string {
  return AVATAR_CHOICES.find((a) => a.id === id)?.url ?? AVATAR_CHOICES[0].url
}

export function resolveAvatarUrl(id: string, uploaded?: string | null): string {
  if (id === UPLOAD_AVATAR_ID && isUploadedPhoto(uploaded)) return uploaded
  return avatarUrlById(id)
}

export function cardholderName(firstName: string, lastInitial: string): string | null {
  const raw = firstName.trim()
  const initial = lastInitial.trim().charAt(0).toUpperCase()
  if (!raw || !initial) return null
  const first = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
  return `${first}.${initial}`
}

export function youHandle(cardName: string | null) {
  return cardName ? `@${cardName}` : 'You'
}

export type ProfileDraft = {
  firstName: string
  lastInitial: string
  avatarId: string
  photo?: string | null
}

export type ProfileDraftResult =
  | { ok: true; firstName: string; lastInitial: string; avatarId: string; cardName: string; photo: string | null }
  | { ok: false; error: string }

export function parseProfileDraft(input: ProfileDraft): ProfileDraftResult {
  const first = input.firstName.replace(/[^a-zA-Z '.-]/g, '').trim().slice(0, 18)
  const initial = input.lastInitial.replace(/[^a-zA-Z]/g, '').slice(0, 1).toUpperCase()
  if (!first) return { ok: false, error: 'Add a first name for the card.' }
  if (!initial) return { ok: false, error: 'Add a last initial.' }
  const uploaded = input.avatarId === UPLOAD_AVATAR_ID
  if (uploaded && !isUploadedPhoto(input.photo)) {
    return { ok: false, error: 'Choose a photo.' }
  }
  if (!uploaded && !AVATAR_CHOICES.some((a) => a.id === input.avatarId)) {
    return { ok: false, error: 'Pick an avatar.' }
  }
  const titled = first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()
  const cardName = cardholderName(titled, initial)
  if (!cardName) return { ok: false, error: 'Add a first name for the card.' }
  return {
    ok: true,
    firstName: titled,
    lastInitial: initial,
    avatarId: input.avatarId,
    cardName,
    photo: uploaded ? input.photo! : null,
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
