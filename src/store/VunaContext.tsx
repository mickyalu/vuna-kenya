import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { avatarUrlById, AVATAR_CHOICES, cardholderName, DEFAULT_AVATAR_ID, FACE_PHOTOS, parseProfileDraft, type ProfileDraft, type ProfileDraftResult } from '../lib/avatars'
import {
  CATALOG_CLUBS,
  clubFromTribe,
  shareInvite,
  uniqueInviteSlug,
  type Club,
} from '../lib/tribes'
import { parseKesInput } from '../lib/money'
import { isMsisdn, maskMsisdn, toKesInteger, toMsisdn } from '../lib/mpesa'
import { describeNotify } from '../lib/notify'
import { later, safeDocument, safeWindow } from '../lib/runtime'
import {
  clearPendingStk,
  loadCredits,
  loadPendingStk,
  lockKesFromCredits,
  rememberCredit,
  savePendingStk,
  type CreditRow,
  type PendingStk,
} from '../lib/credits'
import { clearVunaStore, readJson, readStore, removeStore, writeStore } from '../lib/storage'
import { getStkStatus, pollStkStatus, pushStk, registerMsisdn } from '../lib/stk-client'
import {
  DEFAULT_PINNED,
  emptyPillarTotals,
  PILLARS,
  titleCasePillar,
  type PillarId,
} from '../lib/pillars'
import type {
  Composer,
  FeedPost,
  GiftDraft,
  InAppNotice,
  LeaderRow,
  LogDraft,
  ProtocolLine,
  StkState,
  TabId,
  TransferState,
  Visibility,
} from '../types'
import type { PublicStkStatus } from '../../shared/stk-types'
import { DEFAULT_GIFT_AMOUNT } from '../lib/paybill'

const GOAL_TARGET_KES = 43750
const SEED_DEPOSITS = 87.5

function uid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `vuna-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function emptyLine(): ProtocolLine {
  return { id: uid(), description: '', amount: '', pillar: '', status: 'draft' }
}

function emptyComposer(): Composer {
  return {
    open: false,
    pillar: '',
    activity: '',
    amount: '',
    caption: '',
    postToPulse: false,
    visibility: 'public',
    sending: false,
    checkoutRequestId: null,
    error: null,
  }
}

function idleStk(): StkState {
  return {
    open: false,
    lineId: null,
    status: 'idle',
    error: null,
    checkoutRequestId: null,
    customerMessage: null,
    amountKes: 0,
    activity: '',
  }
}

function isSafaricom(phone: string) {
  return isMsisdn(phone)
}

function hydratePillars(credits: CreditRow[]) {
  const next = emptyPillarTotals()
  for (const row of credits) {
    if (row.kind !== 'lock') continue
    if ((PILLARS as string[]).includes(row.pillar)) {
      const id = row.pillar as PillarId
      next[id] += row.amountKes
    }
  }
  return next
}

const INITIAL_FEED: FeedPost[] = [
  {
    id: 'g-mkuu',
    kind: 'gift',
    handle: '@MKUU_ABAN',
    tribe: 'Karura Runners',
    avatar: FACE_PHOTOS.Mkuu,
    text: 'sent you a Vuna Gift',
    streak: 2,
    minutesAgo: 1,
    salutes: 0,
    saluted: false,
    visibility: 'public',
    giftKes: 20,
    giftFrom: '@MKUU_ABAN',
    giftFromAvatar: FACE_PHOTOS.Mkuu,
    giftTo: 'you',
    giftReply: null,
  },
  {
    id: 'p1',
    handle: '@MKUU_ABAN',
    tribe: 'Karura Runners',
    avatar: FACE_PHOTOS.Mkuu,
    text: 'Just finished my 5AM Karura run. Consistency is the only hack.',
    streak: 2,
    minutesAgo: 10,
    salutes: 12,
    saluted: false,
    visibility: 'public' as const,
  },
  {
    id: 'p2',
    handle: '@SAMANTHA_V',
    tribe: 'Mindful Morning',
    avatar: FACE_PHOTOS.Sam,
    text: 'Cold shower + 10 minutes of stillness before the matatu crush.',
    streak: 15,
    minutesAgo: 60,
    salutes: 8,
    saluted: false,
    visibility: 'public' as const,
  },
  {
    id: 'p3',
    handle: '@NZOMO_K',
    tribe: 'Westlands Lifters',
    avatar: FACE_PHOTOS.Nzomo,
    text: 'Locked KES 200 after completing my gym session. M-Pesa receipt incoming.',
    streak: 7,
    minutesAgo: 180,
    salutes: 5,
    saluted: false,
    visibility: 'public' as const,
  },
]

const INITIAL_LEADERS: LeaderRow[] = [
  { handle: '@SAMANTHA_V', tribe: 'Health', avatar: FACE_PHOTOS.Sam, kes: 12400, streak: 15 },
  { handle: '@MKUU_ABAN', tribe: 'Fitness', avatar: FACE_PHOTOS.Mkuu, kes: 9800, streak: 2 },
  { handle: '@NZOMO_K', tribe: 'Fitness', avatar: FACE_PHOTOS.Nzomo, kes: 7200, streak: 7 },
  { handle: '@AWINO', tribe: 'Lifestyle', avatar: FACE_PHOTOS.Awino, kes: 4100, streak: 4 },
]

const SEED_GIFT_NOTICE: InAppNotice = {
  id: 'n-gift-mkuu',
  kind: 'gift_in',
  title: 'Vuna Gift',
  body: describeNotify({ kind: 'gift_in', handle: '@MKUU_ABAN', kes: 20 }),
  unread: true,
}

type VunaState = {
  tab: TabId
  setTab: (tab: TabId) => void
  deposits: number
  yieldEarned: number
  tickingYield: number
  estimatedHarvest: number
  lockMonths: number
  daysRemaining: number
  goalName: string
  goalTarget: number
  progressPct: number
  pillars: Record<PillarId, number>
  pinnedPillars: PillarId[]
  promotePillar: (id: PillarId, slot: number) => void
  lines: ProtocolLine[]
  protocolError: string | null
  updateLine: (id: string, patch: Partial<ProtocolLine>) => void
  addLine: () => void
  cancelProtocol: () => void
  stk: StkState
  requestStk: (lineId: string) => void
  confirmStk: () => void
  closeStk: () => void
  logDraft: LogDraft
  openLog: (lineId: string) => void
  closeLog: () => void
  setLogMessage: (message: string) => void
  setLogVisibility: (visibility: Visibility) => void
  publishLog: () => void
  mpesaPhone: string
  mpesaMasked: string
  setMpesaPhone: (phone: string) => void
  handleBack: () => boolean
  confirmedLockKes: number
  commitmentTotal: number
  feed: FeedPost[]
  pulseTab: 'feed' | 'leaderboard'
  setPulseTab: (tab: 'feed' | 'leaderboard') => void
  salute: (id: string) => void
  giftDraft: GiftDraft
  openGift: (postId: string) => void
  closeGift: () => void
  setGiftAmount: (amount: 10 | 20 | 50) => void
  sendGift: () => void
  replyGift: (postId: string, message: string) => void
  giftWallet: number
  inbox: InAppNotice[]
  inboxOpen: boolean
  openInbox: () => void
  closeInbox: () => void
  unreadCount: number
  leaders: LeaderRow[]
  streak: number
  totalWins: number
  whatsappConnected: boolean
  connectWhatsApp: () => void
  inviteContacts: () => void
  wrapEnabled: boolean
  setWrapEnabled: (v: boolean) => void
  transfer: TransferState
  openTransfer: () => void
  closeTransfer: () => void
  updateTransfer: (patch: Partial<TransferState>) => void
  sendTransfer: () => void
  liveFriends: number
  firstName: string
  setFirstName: (name: string) => void
  lastInitial: string
  setLastInitial: (initial: string) => void
  cardName: string
  profileEditOpen: boolean
  openProfileEdit: () => void
  closeProfileEdit: () => void
  saveProfile: (input: ProfileDraft) => ProfileDraftResult
  balanceHidden: boolean
  toggleBalanceHidden: () => void
  activeTribePillar: PillarId
  setActiveTribe: (id: PillarId) => void
  clubs: Club[]
  joinedIds: string[]
  activeClub: Club
  setActiveClub: (id: string) => void
  joinClub: (id: string) => void
  leaveClub: (id: string) => void
  createClub: (input: { name: string; line: string; pillar: PillarId }) => void
  inviteClub: (id: string) => void
  optOutTribes: () => void
  eraseDevice: () => void
  chooseActivity: (pillar: PillarId, activity: string) => void
  composer: Composer
  updateComposer: (patch: Partial<Composer>) => void
  closeComposer: () => void
  sendComposerStk: () => void
  notice: InAppNotice | null
  dismissNotice: () => void
  openTribes: () => void
  lockPrompt: string | null
  liveOpen: boolean
  setLiveOpen: (open: boolean) => void
  avatarId: string
  avatarUrl: string
  setAvatarId: (id: string) => void
  monthlyVunas: number
}

const VunaContext = createContext<VunaState | null>(null)

export function VunaProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<TabId>('harvest')
  const [deposits, setDeposits] = useState(() => SEED_DEPOSITS + lockKesFromCredits(loadCredits()))
  const [yieldEarned] = useState(8)
  const tickingYield = 0.1641
  const [lockMonths] = useState(12)
  const [daysRemaining] = useState(280)
  const [goalName] = useState('General Wealth')
  const [pillars, setPillars] = useState<Record<PillarId, number>>(() =>
    hydratePillars(loadCredits()),
  )
  const [pinnedPillars, setPinnedPillars] = useState<PillarId[]>(() => {
    try {
      const raw = readStore('vuna-pinned-pillars')
      if (!raw) return [...DEFAULT_PINNED]
      const parsed = JSON.parse(raw) as PillarId[]
      const valid = parsed.filter((id) => PILLARS.includes(id))
      return valid.length === 4 ? valid : [...DEFAULT_PINNED]
    } catch {
      return [...DEFAULT_PINNED]
    }
  })
  const [lines, setLines] = useState<ProtocolLine[]>([emptyLine()])
  const [protocolError, setProtocolError] = useState<string | null>(null)
  const [feed, setFeed] = useState<FeedPost[]>(INITIAL_FEED)
  const [pulseTab, setPulseTab] = useState<'feed' | 'leaderboard'>('feed')
  const [leaders] = useState<LeaderRow[]>(INITIAL_LEADERS)
  const [streak, setStreak] = useState(0)
  const [totalWins, setTotalWins] = useState(0)
  const [whatsappConnected, setWhatsappConnected] = useState(false)
  const [wrapEnabled, setWrapEnabledState] = useState(
    () => readStore('vuna-wrap') !== 'off',
  )
  const [giftDraft, setGiftDraft] = useState<GiftDraft>({
    open: false,
    postId: null,
    amount: DEFAULT_GIFT_AMOUNT,
    sending: false,
    checkoutRequestId: null,
    error: null,
  })
  const [inbox, setInbox] = useState<InAppNotice[]>([SEED_GIFT_NOTICE])
  const [inboxOpen, setInboxOpen] = useState(false)
  const [firstName, setFirstNameState] = useState(
    () => readStore('vuna-first-name') || 'Michael',
  )
  const [lastInitial, setLastInitialState] = useState(
    () => (readStore('vuna-last-initial') || 'A').slice(0, 1).toUpperCase(),
  )
  const cardName = cardholderName(firstName, lastInitial)
  const [profileEditOpen, setProfileEditOpen] = useState(false)
  const [balanceHidden, setBalanceHidden] = useState(
    () => readStore('vuna-hide-balance') === 'on',
  )
  const [activeTribePillar, setActiveTribePillar] = useState<PillarId>('FITNESS')
  const [customClubs, setCustomClubs] = useState<Club[]>(() => readJson<Club[]>('vuna-custom-clubs', []))
  const [joinedIds, setJoinedIds] = useState<string[]>(() => {
    const stored = readJson<string[]>('vuna-joined-clubs', ['FITNESS'])
    return stored.length ? stored : ['FITNESS']
  })
  const [activeClubId, setActiveClubId] = useState(
    () => readStore('vuna-active-club') || 'FITNESS',
  )
  const [lockPrompt, setLockPrompt] = useState<string | null>(null)
  const [liveOpen, setLiveOpen] = useState(false)
  const [avatarId, setAvatarIdState] = useState(() => {
    const stored = readStore('vuna-avatar')
    return AVATAR_CHOICES.some((a) => a.id === stored) ? stored! : DEFAULT_AVATAR_ID
  })
  const avatarUrl = avatarUrlById(avatarId)
  const [mpesaPhone, setMpesaPhoneState] = useState('')
  const [mpesaMasked, setMpesaMasked] = useState(
    () => readStore('vuna-mpesa-masked') || '',
  )
  const [stk, setStk] = useState<StkState>(idleStk)
  const [logDraft, setLogDraft] = useState<LogDraft>({
    open: false,
    lineId: null,
    message: '',
    visibility: 'public',
  })
  const [transfer, setTransfer] = useState<TransferState>({
    open: false,
    phone: '',
    amount: '',
    error: null,
    success: null,
  })
  const [composer, setComposer] = useState<Composer>(emptyComposer)
  const [notice, setNotice] = useState<InAppNotice | null>(null)
  const resumed = useRef(false)

  useEffect(() => {
    if (!lockPrompt) return
    return later(() => setLockPrompt(null), 4200)
  }, [lockPrompt])

  useEffect(() => {
    if (!notice) return
    return later(() => setNotice(null), 8000)
  }, [notice])

  useEffect(() => {
    const w = safeWindow()
    if (!w) return
    const params = new URLSearchParams(w.location.search)
    const token = params.get('join')
    if (!token) return
    const custom = readJson<Club[]>('vuna-custom-clubs', [])
    const club = [...CATALOG_CLUBS, ...custom].find((c) => c.inviteSlug === token || c.id === token)
    if (club) {
      setJoinedIds((prev) => {
        const next = prev.includes(club.id) ? prev : [...prev, club.id]
        writeStore('vuna-joined-clubs', JSON.stringify(next))
        return next
      })
      setActiveClubId(club.id)
      writeStore('vuna-active-club', club.id)
      setActiveTribePillar(club.pillar)
      setTab('profile')
      const item = {
        id: uid(),
        kind: 'tribe' as const,
        title: `Joined ${club.name}`,
        body: 'You are in the circle. Invite from Profile when you want more people.',
        unread: true,
      }
      setInbox((prev) => [item, ...prev])
      setNotice(item)
    }
    try {
      w.history.replaceState({}, '', w.location.pathname)
    } catch {
      /* Mini App */
    }
  }, [])

  useEffect(() => {
    const legacy = readStore('vuna-mpesa')
    if (!legacy) return
    const n = toMsisdn(legacy)
    removeStore('vuna-mpesa')
    if (!n) return
    setMpesaPhoneState(n)
    const masked = maskMsisdn(n)
    setMpesaMasked(masked)
    writeStore('vuna-mpesa-masked', masked)
    void registerMsisdn(n).catch(() => {})
  }, [])

  const commitmentTotal = useMemo(
    () =>
      lines
        .filter((line) => line.status === 'draft')
        .reduce((sum, line) => sum + parseKesInput(line.amount), 0),
    [lines],
  )

  const estimatedHarvest = deposits + yieldEarned
  const progressPct = Math.min(100, (deposits / GOAL_TARGET_KES) * 100)

  const clubs = useMemo(() => {
    const extra = customClubs.filter((club) => !CATALOG_CLUBS.some((item) => item.id === club.id))
    return [...CATALOG_CLUBS, ...extra]
  }, [customClubs])

  const activeClub = useMemo(() => {
    return (
      clubs.find((club) => club.id === activeClubId) ||
      clubs.find((club) => joinedIds.includes(club.id)) ||
      CATALOG_CLUBS[0]
    )
  }, [clubs, activeClubId, joinedIds])

  const updateLine = useCallback((id: string, patch: Partial<ProtocolLine>) => {
    setLines((prev) => prev.map((line) => (line.id === id ? { ...line, ...patch } : line)))
    setProtocolError(null)
  }, [])

  const addLine = useCallback(() => {
    setLines((prev) => [...prev, emptyLine()])
  }, [])

  const cancelProtocol = useCallback(() => {
    setLines((prev) => {
      const locked = prev.filter((line) => line.status === 'locked')
      return locked.length ? locked : [emptyLine()]
    })
    setProtocolError(null)
    setLockPrompt(null)
    setStk(idleStk())
  }, [])

  const applyConfirmed = useCallback(
    (status: PublicStkStatus, pending: PendingStk | null) => {
      const { added } = rememberCredit(status)
      if (!added) {
        clearPendingStk()
        return
      }
      if (status.kind === 'lock') {
        setDeposits((v) => v + status.amountKes)
        if ((PILLARS as string[]).includes(status.pillar)) {
          const pillar = status.pillar as PillarId
          setPillars((prev) => ({ ...prev, [pillar]: prev[pillar] + status.amountKes }))
        }
        setLines((prev) =>
          prev.map((item) =>
            item.id === status.habitId || item.id === pending?.habitId
              ? { ...item, status: 'locked' as const, amount: String(status.amountKes) }
              : item,
          ),
        )
        setLockPrompt('Locked after M-Pesa callback. When you finish, tap I did it — logging is optional.')
        setLiveOpen(false)
        const posted = Boolean(pending?.postToPulse)
        if (posted && pending) {
          setFeed((prev) => [
            {
              id: uid(),
              handle: `@${cardName}`,
              tribe: pending.pillar ? `${titleCasePillar(pending.pillar as PillarId)} Tribe` : 'Vuna',
              avatar: avatarUrl,
              text: pending.caption || `${status.activity} — locked.`,
              streak,
              minutesAgo: 0,
              salutes: 0,
              saluted: false,
              visibility: pending.visibility || 'public',
            },
            ...prev,
          ])
        }
        setInbox((prev) => [
          {
            id: uid(),
            kind: 'stk',
            title: 'Congratulations',
            body: describeNotify({
              kind: 'stk_success',
              activity: status.activity,
              kes: status.amountKes,
              posted,
            }),
            unread: true,
          },
          ...prev,
        ])
        setNotice({
          id: uid(),
          kind: 'stk',
          title: 'Congratulations',
          body: describeNotify({
            kind: 'stk_success',
            activity: status.activity,
            kes: status.amountKes,
            posted,
          }),
          unread: true,
        })
      } else if (status.kind === 'gift') {
        const toHandle = pending?.giftTo || 'a friend'
        setFeed((prev) => [
          {
            id: uid(),
            kind: 'gift',
            handle: `@${cardName}`,
            tribe: 'Vuna Gift',
            avatar: avatarUrl,
            text: `sent ${toHandle} a Vuna Gift`,
            streak,
            minutesAgo: 0,
            salutes: 0,
            saluted: false,
            visibility: 'public',
            giftKes: status.amountKes,
            giftFrom: `@${cardName}`,
            giftFromAvatar: avatarUrl,
            giftTo: toHandle,
            giftReply: null,
          },
          ...prev,
        ])
        setTab('pulse')
        setPulseTab('feed')
        setInbox((prev) => [
          {
            id: uid(),
            kind: 'gift_sent',
            title: 'Gift is live',
            body: describeNotify({ kind: 'gift_sent', handle: toHandle, kes: status.amountKes }),
            unread: true,
          },
          ...prev,
        ])
        setNotice({
          id: uid(),
          kind: 'gift_sent',
          title: 'Gift is live',
          body: describeNotify({ kind: 'gift_sent', handle: toHandle, kes: status.amountKes }),
          unread: true,
        })
      }
      clearPendingStk()
    },
    [avatarUrl, cardName, streak],
  )

  const watchStk = useCallback(
    async (pending: PendingStk) => {
      try {
        const row = await pollStkStatus(pending.checkoutRequestId, (tick) => {
          if (pending.kind === 'lock') {
            setStk((s) => ({
              ...s,
              status: tick.status === 'pending' ? 'pending' : s.status,
              checkoutRequestId: tick.checkoutRequestId,
            }))
            setComposer((c) =>
              c.checkoutRequestId === tick.checkoutRequestId
                ? { ...c, sending: tick.status === 'pending' }
                : c,
            )
          }
        })
        if (row.status === 'success') {
          applyConfirmed(row, pending)
          setStk(idleStk())
          setComposer(emptyComposer())
          setGiftDraft((g) => ({
            ...g,
            open: false,
            sending: false,
            checkoutRequestId: null,
            postId: null,
          }))
        } else {
          const msg =
            row.status === 'cancelled'
              ? 'You cancelled the Safaricom prompt. Goal balance was not changed.'
              : row.resultDesc || 'STK did not complete. Goal balance was not changed.'
          setStk((s) => ({ ...s, status: 'error', error: msg }))
          setComposer((c) => ({ ...c, sending: false, error: msg }))
          setGiftDraft((g) => ({ ...g, sending: false, error: msg }))
          clearPendingStk()
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Could not read STK status.'
        setStk((s) => ({ ...s, status: 'error', error: msg }))
        setComposer((c) => ({ ...c, sending: false, error: msg }))
        setGiftDraft((g) => ({ ...g, sending: false, error: msg }))
      }
    },
    [applyConfirmed],
  )

  useEffect(() => {
    const pending = loadPendingStk()
    if (!pending || resumed.current) return
    resumed.current = true
    void (async () => {
      try {
        const row = await getStkStatus(pending.checkoutRequestId)
        if (row.status === 'success') {
          applyConfirmed(row, pending)
          return
        }
        if (row.status === 'pending') {
          setStk({
            open: true,
            lineId: pending.kind === 'lock' ? pending.habitId : null,
            status: 'pending',
            error: null,
            checkoutRequestId: pending.checkoutRequestId,
            customerMessage: 'Waiting for the M-Pesa callback. Balance will not move until ResultCode 0.',
            amountKes: pending.amountKes,
            activity: pending.activity,
          })
          await watchStk(pending)
          return
        }
        clearPendingStk()
      } catch {
        await watchStk(pending)
      }
    })()
  }, [applyConfirmed, watchStk])

  const requestStk = useCallback(
    (lineId: string) => {
      const line = lines.find((l) => l.id === lineId)
      if (!line || line.status !== 'draft') {
        setProtocolError('Pick a habit first.')
        return
      }
      if (!line.pillar) {
        setProtocolError('Select a pillar before STK.')
        return
      }
      if (toKesInteger(line.amount) <= 0) {
        setProtocolError('Enter a whole-shilling KES amount, then Safaricom can prompt you.')
        return
      }
      if (!isSafaricom(mpesaPhone) && !mpesaMasked) {
        setProtocolError('Add a Safaricom number on Profile, then send STK.')
        return
      }
      setProtocolError(null)
      setStk({
        ...idleStk(),
        open: true,
        lineId,
        amountKes: toKesInteger(line.amount),
        activity: line.description,
      })
    },
    [lines, mpesaPhone, mpesaMasked],
  )

  const closeStk = useCallback(() => {
    setStk((s) => (s.status === 'pending' || s.status === 'pushing' ? { ...s, open: false } : idleStk()))
  }, [])

  const confirmStk = useCallback(async () => {
    const line = lines.find((l) => l.id === stk.lineId)
    if (!line) {
      setStk(idleStk())
      return
    }
    const amountKes = toKesInteger(line.amount)
    setStk((s) => ({ ...s, status: 'pushing', error: null }))
    try {
      const pushed = await pushStk({
        phone: mpesaPhone || undefined,
        amount: amountKes,
        habitId: line.id,
        activity: line.description,
        pillar: line.pillar || 'FITNESS',
        kind: 'lock',
      })
      const pending: PendingStk = {
        checkoutRequestId: pushed.checkoutRequestID,
        kind: 'lock',
        habitId: line.id,
        activity: line.description,
        pillar: line.pillar || 'FITNESS',
        amountKes,
        startedAt: new Date().toISOString(),
      }
      savePendingStk(pending)
      setLines((prev) =>
        prev.map((item) => (item.id === line.id ? { ...item, status: 'pending' as const } : item)),
      )
      setStk({
        open: true,
        lineId: line.id,
        status: 'pending',
        error: null,
        checkoutRequestId: pushed.checkoutRequestID,
        customerMessage: pushed.customerMessage,
        amountKes,
        activity: line.description,
      })
      await watchStk(pending)
    } catch (err) {
      setStk((s) => ({
        ...s,
        status: 'error',
        error: err instanceof Error ? err.message : 'STK push failed.',
      }))
    }
  }, [lines, stk.lineId, mpesaPhone, watchStk])

  const openLog = useCallback((lineId: string) => {
    const line = lines.find((l) => l.id === lineId)
    if (!line || line.status !== 'locked') {
      setProtocolError('Pay the STK first. A vuna is a paid lock you then claim.')
      return
    }
    setLogDraft({
      open: true,
      lineId,
      message: '',
      visibility: 'public',
    })
  }, [lines])

  const closeLog = useCallback(() => {
    setLogDraft({ open: false, lineId: null, message: '', visibility: 'public' })
  }, [])

  const setLogMessage = useCallback((message: string) => {
    setLogDraft((d) => ({ ...d, message }))
  }, [])

  const setLogVisibility = useCallback((visibility: Visibility) => {
    setLogDraft((d) => ({ ...d, visibility }))
  }, [])

  const publishLog = useCallback(() => {
    const line = lines.find((l) => l.id === logDraft.lineId)
    if (!line || line.status !== 'locked') return
    const note = logDraft.message.trim()
    setTotalWins((v) => v + 1)
    setStreak((v) => v + 1)
    setFeed((prev) => [
      {
        id: uid(),
        handle: `@${cardName}`,
        tribe: line.pillar ? `${titleCasePillar(line.pillar)} Tribe` : 'Vuna',
        avatar: avatarUrl,
        text: note || `${line.description} — done.`,
        streak: streak + 1,
        minutesAgo: 0,
        salutes: 0,
        saluted: false,
        visibility: logDraft.visibility,
      },
      ...prev,
    ])
    setLines((prev) => {
      const next = prev.filter((item) => item.id !== line.id)
      return next.length ? next : [emptyLine()]
    })
    setLogDraft({ open: false, lineId: null, message: '', visibility: 'public' })
    setLockPrompt(null)
    setTab('pulse')
    setPulseTab('feed')
  }, [lines, logDraft, cardName, avatarUrl, streak])

  const setMpesaPhone = useCallback((phone: string) => {
    setMpesaPhoneState(phone)
    const n = toMsisdn(phone)
    if (!n) return
    const masked = maskMsisdn(n)
    setMpesaMasked(masked)
    writeStore('vuna-mpesa-masked', masked)
    void registerMsisdn(n)
      .then(() =>
        fetch('/api/profile/wrap', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled: wrapEnabled, name: cardName }),
        }),
      )
      .catch(() => {})
  }, [cardName, wrapEnabled])

  const pushNotice = useCallback((item: InAppNotice) => {
    setInbox((prev) => [item, ...prev.filter((n) => n.id !== item.id)])
    setNotice(item)
  }, [])

  const salute = useCallback((id: string) => {
    setFeed((prev) =>
      prev.map((post) => {
        if (post.id !== id) return post
        if (post.saluted) {
          return { ...post, saluted: false, salutes: Math.max(0, post.salutes - 1) }
        }
        return { ...post, saluted: true, salutes: post.salutes + 1 }
      }),
    )
  }, [])

  const openGift = useCallback((postId: string) => {
    setGiftDraft({
      open: true,
      postId,
      amount: DEFAULT_GIFT_AMOUNT,
      sending: false,
      checkoutRequestId: null,
      error: null,
    })
  }, [])

  const closeGift = useCallback(() => {
    setGiftDraft((g) => (g.sending ? g : { ...g, open: false, postId: null, error: null }))
  }, [])

  const setGiftAmount = useCallback((amount: 10 | 20 | 50) => {
    setGiftDraft((g) => (g.sending ? g : { ...g, amount, error: null }))
  }, [])

  const sendGift = useCallback(async () => {
    if (giftDraft.sending || !giftDraft.postId) return
    const post = feed.find((p) => p.id === giftDraft.postId)
    if (!post) return
    if (!isSafaricom(mpesaPhone) && !mpesaMasked) {
      setGiftDraft((g) => ({ ...g, error: 'Add your Safaricom number so the STK can land.' }))
      return
    }
    const kes = toKesInteger(giftDraft.amount)
    const toHandle = post.handle
    setGiftDraft((g) => ({ ...g, sending: true, error: null }))
    try {
      const pushed = await pushStk({
        phone: mpesaPhone || undefined,
        amount: kes,
        habitId: `gift-${post.id}`,
        activity: `Vuna Gift ${toHandle}`,
        pillar: 'COMMUNITY',
        kind: 'gift',
        accountReference: 'GIFT',
      })
      const pending: PendingStk = {
        checkoutRequestId: pushed.checkoutRequestID,
        kind: 'gift',
        habitId: `gift-${post.id}`,
        activity: `Vuna Gift ${toHandle}`,
        pillar: 'COMMUNITY',
        amountKes: kes,
        giftTo: toHandle,
        giftPostId: post.id,
        startedAt: new Date().toISOString(),
      }
      savePendingStk(pending)
      setGiftDraft((g) => ({ ...g, sending: true, checkoutRequestId: pushed.checkoutRequestID }))
      await watchStk(pending)
    } catch (err) {
      setGiftDraft((g) => ({
        ...g,
        sending: false,
        error: err instanceof Error ? err.message : 'Gift STK failed.',
      }))
    }
  }, [giftDraft, feed, mpesaPhone, mpesaMasked, watchStk])

  const replyGift = useCallback(
    (postId: string, message: string) => {
      const note = message.trim()
      if (!note) return
      const post = feed.find((p) => p.id === postId)
      if (!post || post.kind !== 'gift' || post.giftReply) return
      setFeed((prev) =>
        prev.map((item) =>
          item.id === postId
            ? { ...item, giftReply: note, giftReplyFrom: `@${cardName}` }
            : item,
        ),
      )
      pushNotice({
        id: uid(),
        kind: 'gift_reply',
        title: 'Reply sent',
        body: `${post.giftFrom} will see: ${note}`,
      })
    },
    [feed, cardName, pushNotice],
  )

  const openInbox = useCallback(() => {
    setInboxOpen(true)
    setInbox((prev) => prev.map((n) => ({ ...n, unread: false })))
    setNotice(null)
  }, [])

  const closeInbox = useCallback(() => {
    setInboxOpen(false)
  }, [])

  const unreadCount = useMemo(() => inbox.filter((n) => n.unread).length, [inbox])
  const giftWallet = useMemo(
    () =>
      feed
        .filter((p) => p.kind === 'gift' && (p.giftTo === 'you' || p.giftTo === `@${cardName}`))
        .reduce((sum, p) => sum + (p.giftKes ?? 0), 0),
    [feed, cardName],
  )

  const setActiveClub = useCallback(
    (id: string) => {
      const club = clubs.find((item) => item.id === id)
      if (!club) return
      setActiveClubId(id)
      writeStore('vuna-active-club', id)
      setActiveTribePillar(club.pillar)
    },
    [clubs],
  )

  const joinClub = useCallback(
    (id: string) => {
      const club = clubs.find((item) => item.id === id)
      if (!club) return
      setJoinedIds((prev) => {
        const next = prev.includes(id) ? prev : [...prev, id]
        writeStore('vuna-joined-clubs', JSON.stringify(next))
        return next
      })
      setActiveClubId(id)
      writeStore('vuna-active-club', id)
      setActiveTribePillar(club.pillar)
      pushNotice({
        id: uid(),
        kind: 'tribe',
        title: `Joined ${club.name}`,
        body: `${club.live} people live. Invite when you want the circle bigger.`,
        unread: true,
      })
    },
    [clubs, pushNotice],
  )

  const leaveClub = useCallback(
    (id: string) => {
      setJoinedIds((prev) => {
        const next = prev.filter((item) => item !== id)
        writeStore('vuna-joined-clubs', JSON.stringify(next))
        if (activeClubId === id) {
          const fallback = next[0] || 'FITNESS'
          setActiveClubId(fallback)
          writeStore('vuna-active-club', fallback)
          const club = clubs.find((item) => item.id === fallback)
          if (club) setActiveTribePillar(club.pillar)
        }
        return next
      })
    },
    [activeClubId, clubs],
  )

  const inviteClub = useCallback(
    (id: string) => {
      const club = clubs.find((item) => item.id === id)
      if (!club) return
      void shareInvite(club)
      pushNotice({
        id: uid(),
        kind: 'tribe',
        title: 'Invite link ready',
        body: `Share ${club.name} with friends. Link is copied; WhatsApp opens if share is cancelled.`,
        unread: true,
      })
    },
    [clubs, pushNotice],
  )

  const createClub = useCallback(
    (input: { name: string; line: string; pillar: PillarId }) => {
      const name = input.name.trim()
      if (!name) return
      const id = `club-${uid()}`
      const you = avatarUrl
        ? {
            initials: `${(firstName[0] || 'M').toUpperCase()}${lastInitial}`,
            tone: '#6b4f3a',
            name: cardName,
            photo: avatarUrl,
          }
        : null
      const club: Club = {
        ...clubFromTribe(
          {
            pillar: input.pillar,
            name,
            line: input.line.trim() || 'A VUNA circle.',
            live: 1,
            members: you ? [you] : [],
          },
          id,
        ),
        createdByYou: true,
        inviteSlug: uniqueInviteSlug(
          name,
          clubs.map((item) => item.inviteSlug),
        ),
      }
      setCustomClubs((prev) => {
        const next = [...prev, club]
        writeStore('vuna-custom-clubs', JSON.stringify(next))
        return next
      })
      setJoinedIds((prev) => {
        const next = prev.includes(club.id) ? prev : [...prev, club.id]
        writeStore('vuna-joined-clubs', JSON.stringify(next))
        return next
      })
      setActiveClubId(club.id)
      writeStore('vuna-active-club', club.id)
      setActiveTribePillar(club.pillar)
      void shareInvite(club)
      pushNotice({
        id: uid(),
        kind: 'tribe',
        title: `${club.name} is live`,
        body: 'Invite link copied. Send it to friends or a community — same motion as a Strava club.',
        unread: true,
      })
    },
    [avatarUrl, cardName, clubs, firstName, lastInitial, pushNotice],
  )

  const optOutTribes = useCallback(() => {
    setJoinedIds([])
    writeStore('vuna-joined-clubs', JSON.stringify([]))
    pushNotice({
      id: uid(),
      kind: 'tribe',
      title: 'Left all tribes',
      body: 'Join again from Profile whenever you want the circle.',
      unread: true,
    })
  }, [pushNotice])

  const eraseDevice = useCallback(() => {
    clearVunaStore()
    const w = safeWindow()
    if (w) w.location.reload()
  }, [])

  const connectWhatsApp = useCallback(() => {
    setWhatsappConnected(true)
  }, [])

  const inviteContacts = useCallback(() => {
    const text = 'Join me on VUNA — lock KES against your habits and harvest consistency. https://vuna.app'
    const w = safeWindow()
    if (w?.open) {
      w.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
    }
  }, [])

  const openTransfer = useCallback(() => {
    setTransfer({
      open: true,
      phone: '',
      amount: '',
      error: null,
      success: null,
    })
  }, [])

  const closeTransfer = useCallback(() => {
    setTransfer((t) => ({ ...t, open: false }))
  }, [])

  const updateTransfer = useCallback((patch: Partial<TransferState>) => {
    setTransfer((t) => ({ ...t, ...patch, error: patch.error ?? null }))
  }, [])

  const setAvatarId = useCallback((id: string) => {
    setAvatarIdState(id)
    writeStore('vuna-avatar', id)
  }, [])

  const setFirstName = useCallback((name: string) => {
    const next = name.trim() || 'Michael'
    setFirstNameState(next)
    writeStore('vuna-first-name', next)
  }, [])

  const setLastInitial = useCallback((initial: string) => {
    const next = initial.replace(/[^a-zA-Z]/g, '').slice(0, 1).toUpperCase()
    setLastInitialState(next)
    writeStore('vuna-last-initial', next)
  }, [])

  const openProfileEdit = useCallback(() => setProfileEditOpen(true), [])
  const closeProfileEdit = useCallback(() => setProfileEditOpen(false), [])

  const saveProfile = useCallback((input: ProfileDraft): ProfileDraftResult => {
    const parsed = parseProfileDraft(input)
    if (!parsed.ok) return parsed
    setFirstNameState(parsed.firstName)
    writeStore('vuna-first-name', parsed.firstName)
    setLastInitialState(parsed.lastInitial)
    writeStore('vuna-last-initial', parsed.lastInitial)
    setAvatarIdState(parsed.avatarId)
    writeStore('vuna-avatar', parsed.avatarId)
    setProfileEditOpen(false)
    pushNotice({
      id: uid(),
      kind: 'profile',
      title: 'Profile updated',
      body: `The card now reads ${parsed.cardName}.`,
      unread: true,
    })
    void fetch('/api/profile/wrap', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: wrapEnabled, name: parsed.cardName }),
    }).catch(() => {})
    return parsed
  }, [pushNotice, wrapEnabled])

  const toggleBalanceHidden = useCallback(() => {
    setBalanceHidden((v) => {
      const next = !v
      writeStore('vuna-hide-balance', next ? 'on' : 'off')
      return next
    })
  }, [])

  const setWrapEnabled = useCallback((v: boolean) => {
    setWrapEnabledState(v)
    writeStore('vuna-wrap', v ? 'on' : 'off')
    void fetch('/api/profile/wrap', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: v, name: cardName }),
    }).catch(() => {})
    pushNotice({
      id: uid(),
      kind: 'wrap',
      title: v ? 'Weekly Friday Wrap enabled' : 'Weekly Friday Wrap disabled',
      body: v
        ? 'WhatsApp scorecard lands Friday 18:00 EAT when a Safaricom number is on file.'
        : 'No Friday 18:00 auditor message until you switch it back on.',
      unread: true,
    })
  }, [cardName, pushNotice])

  const setActiveTribe = useCallback((id: PillarId) => {
    setActiveTribePillar(id)
    setActiveClubId(id)
    writeStore('vuna-active-club', id)
  }, [])

  const chooseActivity = useCallback((pillar: PillarId, activity: string) => {
    const name = activity.trim()
    if (!name) return
    setActiveTribePillar(pillar)
    setProtocolError(null)
    setLiveOpen(false)
    setNotice(null)
    setComposer({
      open: true,
      pillar,
      activity: name,
      amount: '',
      caption: '',
      postToPulse: false,
      visibility: 'public',
      sending: false,
      checkoutRequestId: null,
      error: null,
    })
  }, [])

  const updateComposer = useCallback((patch: Partial<Composer>) => {
    setComposer((prev) => (prev.sending ? prev : { ...prev, ...patch, error: patch.error ?? null }))
  }, [])

  const closeComposer = useCallback(() => {
    setComposer((prev) => (prev.sending ? prev : emptyComposer()))
  }, [])

  const dismissNotice = useCallback(() => {
    setNotice(null)
  }, [])

  const sendComposerStk = useCallback(async () => {
    if (composer.sending) return
    const activity = composer.activity.trim()
    if (!activity || !composer.pillar) {
      setComposer((c) => ({ ...c, error: 'Pick an activity first.' }))
      return
    }
    const kes = toKesInteger(composer.amount)
    if (kes <= 0) {
      setComposer((c) => ({
        ...c,
        error: 'M-Pesa takes whole shillings. Enter at least KES 1.',
      }))
      return
    }
    if (!isSafaricom(mpesaPhone) && !mpesaMasked) {
      setComposer((c) => ({
        ...c,
        error: 'Add your Safaricom number so the STK can land.',
      }))
      return
    }

    const pillar = composer.pillar
    const caption = composer.caption.trim()
    const postToPulse = composer.postToPulse
    const visibility = composer.visibility
    const habitId = uid()
    setComposer((c) => ({ ...c, sending: true, error: null }))
    setNotice(null)
    try {
      const pushed = await pushStk({
        phone: mpesaPhone || undefined,
        amount: kes,
        habitId,
        activity,
        pillar,
        kind: 'lock',
      })
      const pending: PendingStk = {
        checkoutRequestId: pushed.checkoutRequestID,
        kind: 'lock',
        habitId,
        activity,
        pillar,
        amountKes: kes,
        postToPulse,
        caption,
        visibility,
        startedAt: new Date().toISOString(),
      }
      savePendingStk(pending)
      setLines((prev) => [
        { id: habitId, description: activity, amount: String(kes), pillar, status: 'pending' },
        ...prev.filter((l) => l.description || l.status === 'locked' || l.status === 'pending'),
      ])
      setComposer((c) => ({ ...c, sending: true, checkoutRequestId: pushed.checkoutRequestID }))
      setStk({
        open: false,
        lineId: habitId,
        status: 'pending',
        error: null,
        checkoutRequestId: pushed.checkoutRequestID,
        customerMessage: pushed.customerMessage,
        amountKes: kes,
        activity,
      })
      await watchStk(pending)
    } catch (err) {
      setComposer((c) => ({
        ...c,
        sending: false,
        error: err instanceof Error ? err.message : 'STK push failed.',
      }))
    }
  }, [composer, mpesaPhone, mpesaMasked, watchStk])

  const openTribes = useCallback(() => {
    setTab('profile')
    later(() => {
      safeDocument()?.getElementById('vuna-tribes')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }, [])

  const promotePillar = useCallback((id: PillarId, slot: number) => {
    setPinnedPillars((prev) => {
      if (prev[slot] === id) return prev
      const next = [...prev]
      const existing = next.indexOf(id)
      if (existing >= 0) {
        next[existing] = prev[slot]
      }
      next[slot] = id
      writeStore('vuna-pinned-pillars', JSON.stringify(next))
      return next
    })
  }, [])

  const sendTransfer = useCallback(() => {
    const amount = toKesInteger(transfer.amount)
    const msisdn = toMsisdn(transfer.phone)
    if (!msisdn) {
      setTransfer((t) => ({
        ...t,
        error: 'Enter a Safaricom MSISDN (07XXXXXXXX or 2547XXXXXXXX).',
        success: null,
      }))
      return
    }
    if (amount <= 0) {
      setTransfer((t) => ({ ...t, error: 'Enter a whole-shilling KES amount.', success: null }))
      return
    }
    setTransfer((t) => ({
      ...t,
      error: null,
      success: `B2C payout is not live in the CMA sandbox. ${maskMsisdn(msisdn)} was not charged. Confirmed protocol deposits stay until Safaricom B2C is enabled.`,
    }))
  }, [transfer.amount, transfer.phone])

  const handleBack = useCallback(() => {
    if (profileEditOpen) {
      setProfileEditOpen(false)
      return true
    }
    if (inboxOpen) {
      setInboxOpen(false)
      return true
    }
    if (giftDraft.open) {
      setGiftDraft((g) => (g.sending ? { ...g, open: false } : { ...g, open: false, postId: null }))
      return true
    }
    if (composer.open) {
      if (!composer.sending) setComposer(emptyComposer())
      else setComposer((c) => ({ ...c, open: true }))
      return true
    }
    if (stk.open) {
      setStk((s) => ({ ...s, open: false }))
      return true
    }
    if (transfer.open) {
      setTransfer((t) => ({ ...t, open: false }))
      return true
    }
    if (logDraft.open) {
      setLogDraft({ open: false, lineId: null, message: '', visibility: 'public' })
      return true
    }
    if (liveOpen) {
      setLiveOpen(false)
      return true
    }
    if (notice) {
      setNotice(null)
      return true
    }
    if (tab !== 'harvest') {
      setTab('harvest')
      return true
    }
    return false
  }, [profileEditOpen, inboxOpen, giftDraft.open, composer.open, composer.sending, stk.open, transfer.open, logDraft.open, liveOpen, notice, tab])

  const confirmedLockKes = lockKesFromCredits(loadCredits())

  const value: VunaState = {
    tab,
    setTab,
    deposits,
    yieldEarned,
    tickingYield,
    estimatedHarvest,
    lockMonths,
    daysRemaining,
    goalName,
    goalTarget: GOAL_TARGET_KES,
    progressPct,
    pillars,
    pinnedPillars,
    promotePillar,
    lines,
    protocolError,
    updateLine,
    addLine,
    cancelProtocol,
    stk,
    requestStk,
    confirmStk,
    closeStk,
    logDraft,
    openLog,
    closeLog,
    setLogMessage,
    setLogVisibility,
    publishLog,
    mpesaPhone,
    mpesaMasked,
    setMpesaPhone,
    handleBack,
    confirmedLockKes,
    commitmentTotal,
    feed,
    pulseTab,
    setPulseTab,
    salute,
    giftDraft,
    openGift,
    closeGift,
    setGiftAmount,
    sendGift,
    replyGift,
    giftWallet,
    inbox,
    inboxOpen,
    openInbox,
    closeInbox,
    unreadCount,
    leaders,
    streak,
    totalWins,
    whatsappConnected,
    connectWhatsApp,
    inviteContacts,
    wrapEnabled,
    setWrapEnabled,
    transfer,
    openTransfer,
    closeTransfer,
    updateTransfer,
    sendTransfer,
    liveFriends: 3,
    firstName,
    setFirstName,
    lastInitial,
    setLastInitial,
    cardName,
    profileEditOpen,
    openProfileEdit,
    closeProfileEdit,
    saveProfile,
    balanceHidden,
    toggleBalanceHidden,
    activeTribePillar,
    setActiveTribe,
    clubs,
    joinedIds,
    activeClub,
    setActiveClub,
    joinClub,
    leaveClub,
    createClub,
    inviteClub,
    optOutTribes,
    eraseDevice,
    chooseActivity,
    composer,
    updateComposer,
    closeComposer,
    sendComposerStk,
    notice,
    dismissNotice,
    openTribes,
    lockPrompt,
    liveOpen,
    setLiveOpen,
    avatarId,
    avatarUrl,
    setAvatarId,
    monthlyVunas: totalWins,
  }

  return <VunaContext.Provider value={value}>{children}</VunaContext.Provider>
}

export function useVuna() {
  const ctx = useContext(VunaContext)
  if (!ctx) throw new Error('useVuna must be used inside VunaProvider')
  return ctx
}

