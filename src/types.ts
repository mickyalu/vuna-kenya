import type { PillarId } from './lib/pillars'

export type TabId = 'harvest' | 'lock' | 'pulse' | 'profile'

export type { PillarId }
export { DEFAULT_PINNED, PILLARS } from './lib/pillars'

export type Visibility = 'public' | 'friends'
export type ProtocolStatus = 'draft' | 'locked'

export type ProtocolLine = {
  id: string
  description: string
  amount: string
  pillar: PillarId | ''
  status: ProtocolStatus
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
  visibility: Visibility
}

export type StkState = {
  open: boolean
  lineId: string | null
  status: 'idle' | 'pushing' | 'error'
  error: string | null
}

export type LogDraft = {
  open: boolean
  lineId: string | null
  message: string
  visibility: Visibility
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
