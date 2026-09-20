export type AvatarChoice = {
  id: string
  url: string
  label: string
}

export const AVATAR_CHOICES: AvatarChoice[] = [
  {
    id: 'mike',
    label: 'Mike',
    url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Mike&backgroundColor=1a1a1a',
  },
  {
    id: 'awa',
    label: 'Awa',
    url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Awa&backgroundColor=1a1a1a',
  },
  {
    id: 'kito',
    label: 'Kito',
    url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Kito&backgroundColor=1a1a1a',
  },
  {
    id: 'zuri',
    label: 'Zuri',
    url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Zuri&backgroundColor=1a1a1a',
  },
  {
    id: 'nuru',
    label: 'Nuru',
    url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Nuru&backgroundColor=1a1a1a',
  },
  {
    id: 'leo',
    label: 'Leo',
    url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Leo&backgroundColor=1a1a1a',
  },
  {
    id: 'amina',
    label: 'Amina',
    url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Amina&backgroundColor=1a1a1a',
  },
  {
    id: 'otieno',
    label: 'Otieno',
    url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Otieno&backgroundColor=1a1a1a',
  },
]

export const DEFAULT_AVATAR_ID = 'mike'

export function avatarUrlById(id: string): string {
  return AVATAR_CHOICES.find((a) => a.id === id)?.url ?? AVATAR_CHOICES[0].url
}

export const FACE_PHOTOS: Record<string, string> = {
  Mkuu: 'https://randomuser.me/api/portraits/men/32.jpg',
  Nzomo: 'https://randomuser.me/api/portraits/men/75.jpg',
  Awino: 'https://randomuser.me/api/portraits/women/65.jpg',
  Sam: 'https://randomuser.me/api/portraits/women/44.jpg',
  Leila: 'https://randomuser.me/api/portraits/women/68.jpg',
  Joe: 'https://randomuser.me/api/portraits/men/22.jpg',
  Ken: 'https://randomuser.me/api/portraits/men/45.jpg',
}

export function monthLabel(now = new Date()) {
  return now.toLocaleString('en-KE', { month: 'long', year: 'numeric' })
}
