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

export type FeedKind = 'vuna' | 'gift'

export type FeedPost = {
  id: string
  kind?: FeedKind
  handle: string
  tribe: string
  avatar: string
  text: string
  streak: number
  minutesAgo: number
  salutes: number
  saluted: boolean
  visibility: Visibility
  giftKes?: number
  giftFrom?: string
  giftFromAvatar?: string
  giftTo?: string
  giftReply?: string | null
  giftReplyFrom?: string
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

export type Composer = {
  open: boolean
  pillar: PillarId | ''
  activity: string
  amount: string
  caption: string
  postToPulse: boolean
  visibility: Visibility
  sending: boolean
  error: string | null
}

export type NoticeKind = 'stk' | 'gift_in' | 'gift_sent' | 'gift_reply'

export type InAppNotice = {
  id: string
  kind: NoticeKind
  title: string
  body: string
  unread?: boolean
}

export type GiftDraft = {
  open: boolean
  postId: string | null
  amount: 10 | 20 | 50
  sending: boolean
  error: string | null
}

export type TransferState = {
  open: boolean
  phone: string
  amount: string
  error: string | null
  success: string | null
}
