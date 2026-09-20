import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { avatarUrlById, DEFAULT_AVATAR_ID, FACE_PHOTOS } from '../lib/avatars'
import { parseKesInput } from '../lib/money'
import { describeNotify } from '../lib/notify'
import { readStore, writeStore } from '../lib/storage'
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
  InAppNotice,
  LeaderRow,
  LogDraft,
  ProtocolLine,
  StkState,
  TabId,
  TransferState,
  Visibility,
} from '../types'

const GOAL_TARGET_KES = 43750

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
    postToPulse: true,
    visibility: 'public',
    sending: false,
    error: null,
  }
}

function isSafaricom(phone: string) {
  return /^(\+?254|0)7\d{8}$/.test(phone.replace(/\s/g, ''))
}

const INITIAL_FEED: FeedPost[] = [
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
  setMpesaPhone: (phone: string) => void
  commitmentTotal: number
  feed: FeedPost[]
  pulseTab: 'feed' | 'leaderboard'
  setPulseTab: (tab: 'feed' | 'leaderboard') => void
  salute: (id: string) => void
  gift: (id: string) => void
  giftNotice: string | null
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
  activeTribePillar: PillarId
  setActiveTribe: (id: PillarId) => void
  chooseActivity: (pillar: PillarId, activity: string) => void
  composer: Composer
  updateComposer: (patch: Partial<Composer>) => void
  closeComposer: () => void
  sendComposerStk: () => void
  notice: InAppNotice | null
  dismissNotice: () => void
  tribeDrawerOpen: boolean
  openTribes: () => void
  closeTribes: () => void
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
  const [deposits, setDeposits] = useState(87.5)
  const [yieldEarned] = useState(8)
  const tickingYield = 0.1641
  const [lockMonths] = useState(12)
  const [daysRemaining] = useState(280)
  const [goalName] = useState('General Wealth')
  const [pillars, setPillars] = useState<Record<PillarId, number>>(emptyPillarTotals)
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
  const [giftNotice, setGiftNotice] = useState<string | null>(null)
  const [firstName, setFirstNameState] = useState(
    () => readStore('vuna-first-name') || 'Michael',
  )
  const [activeTribePillar, setActiveTribePillar] = useState<PillarId>('FITNESS')
  const [tribeDrawerOpen, setTribeDrawerOpen] = useState(false)
  const [lockPrompt, setLockPrompt] = useState<string | null>(null)
  const [liveOpen, setLiveOpen] = useState(false)
  const [avatarId, setAvatarIdState] = useState(
    () => readStore('vuna-avatar') || DEFAULT_AVATAR_ID,
  )
  const avatarUrl = avatarUrlById(avatarId)
  const [mpesaPhone, setMpesaPhoneState] = useState(
    () => readStore('vuna-mpesa') || '',
  )
  const [stk, setStk] = useState<StkState>({
    open: false,
    lineId: null,
    status: 'idle',
    error: null,
  })
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

  useEffect(() => {
    if (!lockPrompt) return
    const id = window.setTimeout(() => setLockPrompt(null), 4200)
    return () => window.clearTimeout(id)
  }, [lockPrompt])

  useEffect(() => {
    if (!notice) return
    const id = window.setTimeout(() => setNotice(null), 5200)
    return () => window.clearTimeout(id)
  }, [notice])

  useEffect(() => {
    if (!giftNotice) return
    const id = window.setTimeout(() => setGiftNotice(null), 2600)
    return () => window.clearTimeout(id)
  }, [giftNotice])

  const commitmentTotal = useMemo(
    () =>
      lines
        .filter((line) => line.status === 'draft')
        .reduce((sum, line) => sum + parseKesInput(line.amount), 0),
    [lines],
  )

  const estimatedHarvest = deposits + yieldEarned
  const progressPct = Math.min(100, (deposits / GOAL_TARGET_KES) * 100)

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
    setStk({ open: false, lineId: null, status: 'idle', error: null })
  }, [])

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
      if (parseKesInput(line.amount) <= 0) {
        setProtocolError('Enter a KES amount, then Safaricom can prompt you.')
        return
      }
      if (!isSafaricom(mpesaPhone)) {
        setProtocolError('Add a Safaricom number on Profile, then send STK.')
        return
      }
      setProtocolError(null)
      setStk({ open: true, lineId, status: 'idle', error: null })
    },
    [lines, mpesaPhone],
  )

  const closeStk = useCallback(() => {
    setStk({ open: false, lineId: null, status: 'idle', error: null })
  }, [])

  const confirmStk = useCallback(() => {
    const line = lines.find((l) => l.id === stk.lineId)
    if (!line) {
      setStk({ open: false, lineId: null, status: 'idle', error: null })
      return
    }
    setStk((s) => ({ ...s, status: 'pushing', error: null }))
    window.setTimeout(() => {
      const kes = parseKesInput(line.amount)
      setDeposits((v) => v + kes)
      if (line.pillar) {
        const pillar = line.pillar
        setPillars((prev) => ({ ...prev, [pillar]: prev[pillar] + kes }))
      }
      setLines((prev) =>
        prev.map((item) => (item.id === line.id ? { ...item, status: 'locked' as const } : item)),
      )
      setStk({ open: false, lineId: null, status: 'idle', error: null })
      setLockPrompt('Locked. When you finish, tap I did it — or say nothing. Logging is optional.')
      setNotice({
        id: uid(),
        title: 'Congratulations',
        body: describeNotify({
          kind: 'stk_success',
          activity: line.description,
          kes,
          posted: false,
        }),
      })
      setLiveOpen(false)
    }, 1100)
  }, [lines, stk.lineId])

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
        handle: `@${firstName.toUpperCase()}`,
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
  }, [lines, logDraft, firstName, avatarUrl, streak])

  const setMpesaPhone = useCallback((phone: string) => {
    setMpesaPhoneState(phone)
    writeStore('vuna-mpesa', phone)
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

  const gift = useCallback(
    (id: string) => {
      const post = feed.find((p) => p.id === id)
      if (!post) return
      if (deposits < 50) {
        setGiftNotice('Need at least KES 50.00 in protocol to send a Vuna Gift.')
        return
      }
      setDeposits((v) => v - 50)
      setGiftNotice(`Sent KES 50.00 Vuna Gift to ${post.handle} via M-Pesa.`)
    },
    [deposits, feed],
  )

  const connectWhatsApp = useCallback(() => {
    setWhatsappConnected(true)
  }, [])

  const inviteContacts = useCallback(() => {
    const text = encodeURIComponent(
      'Join me on VUNA — lock KES against your habits and harvest consistency. https://vuna.app',
    )
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer')
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

  const setWrapEnabled = useCallback((v: boolean) => {
    setWrapEnabledState(v)
    writeStore('vuna-wrap', v ? 'on' : 'off')
  }, [])

  const setActiveTribe = useCallback((id: PillarId) => {
    setActiveTribePillar(id)
  }, [])

  const chooseActivity = useCallback((pillar: PillarId, activity: string) => {
    const name = activity.trim()
    if (!name) return
    setActiveTribePillar(pillar)
    setProtocolError(null)
    setLiveOpen(false)
    setComposer({
      open: true,
      pillar,
      activity: name,
      amount: '',
      caption: '',
      postToPulse: true,
      visibility: 'public',
      sending: false,
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

  const sendComposerStk = useCallback(() => {
    if (composer.sending) return
    const activity = composer.activity.trim()
    if (!activity || !composer.pillar) {
      setComposer((c) => ({ ...c, error: 'Pick an activity first.' }))
      return
    }
    const kes = parseKesInput(composer.amount)
    if (kes <= 0) {
      setComposer((c) => ({
        ...c,
        error: 'Enter a KES amount, then Safaricom can prompt you.',
      }))
      return
    }
    if (!isSafaricom(mpesaPhone)) {
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
    setComposer((c) => ({ ...c, sending: true, error: null }))

    window.setTimeout(() => {
      setDeposits((v) => v + kes)
      setPillars((prev) => ({ ...prev, [pillar]: prev[pillar] + kes }))
      setTotalWins((v) => v + 1)
      setStreak((v) => v + 1)
      if (postToPulse) {
        setFeed((prev) => [
          {
            id: uid(),
            handle: `@${firstName.toUpperCase()}`,
            tribe: `${titleCasePillar(pillar)} Tribe`,
            avatar: avatarUrl,
            text: caption || `${activity} — locked.`,
            streak: streak + 1,
            minutesAgo: 0,
            salutes: 0,
            saluted: false,
            visibility,
          },
          ...prev,
        ])
      }
      setComposer(emptyComposer())
      setNotice({
        id: uid(),
        title: 'Congratulations',
        body: describeNotify({ kind: 'stk_success', activity, kes, posted: postToPulse }),
      })
    }, 1100)
  }, [composer, mpesaPhone, firstName, avatarUrl, streak])

  const openTribes = useCallback(() => {
    setTab('pulse')
    setTribeDrawerOpen(true)
  }, [])

  const closeTribes = useCallback(() => {
    setTribeDrawerOpen(false)
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
    const amount = parseKesInput(transfer.amount)
    const phone = transfer.phone.replace(/\s/g, '')
    if (!/^(\+?254|0)7\d{8}$/.test(phone)) {
      setTransfer((t) => ({
        ...t,
        error: 'Enter a valid Safaricom number (07XX or +2547XX).',
        success: null,
      }))
      return
    }
    if (amount <= 0) {
      setTransfer((t) => ({ ...t, error: 'Enter a KES amount to send.', success: null }))
      return
    }
    if (amount > deposits) {
      setTransfer((t) => ({
        ...t,
        error: `Only ${deposits.toFixed(2)} KES is liquid enough to send.`,
        success: null,
      }))
      return
    }
    setDeposits((v) => v - amount)
    setTransfer({
      open: true,
      phone,
      amount: '',
      error: null,
      success: `M-Pesa request sent to ${phone} for KES ${amount.toFixed(2)}.`,
    })
  }, [deposits, transfer.amount, transfer.phone])

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
    setMpesaPhone,
    commitmentTotal,
    feed,
    pulseTab,
    setPulseTab,
    salute,
    gift,
    giftNotice,
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
    activeTribePillar,
    setActiveTribe,
    chooseActivity,
    composer,
    updateComposer,
    closeComposer,
    sendComposerStk,
    notice,
    dismissNotice,
    tribeDrawerOpen,
    openTribes,
    closeTribes,
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

