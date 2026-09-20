export type TabId = 'harvest' | 'lock' | 'pulse' | 'profile'

export const PILLARS = ['FITNESS', 'HEALTH', 'HABITS', 'LIFESTYLE'] as const
export type PillarId = (typeof PILLARS)[number]

export type ProtocolLine = {
  id: string
  description: string
  amount: string
  pillar: PillarId | ''
}

export type FeedPost = {
  id: string
  handle: string
  tribe: string
  avatar: string
  text: string
  streak: number
  minutesAgo: number
  salutes: number
  saluted: boolean
}

export type LeaderRow = {
  handle: string
  tribe: string
  avatar: string
  kes: number
  streak: number
}

export type TransferState = {
  open: boolean
  phone: string
  amount: string
  error: string | null
  success: string | null
}
