import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { parseKesInput } from '../lib/money'
import type {
  FeedPost,
  LeaderRow,
  PillarId,
  ProtocolLine,
  TabId,
  TransferState,
} from '../types'

const GOAL_TARGET_KES = 43750

function uid() {
  return crypto.randomUUID()
}

function emptyLine(): ProtocolLine {
  return { id: uid(), description: '', amount: '', pillar: '' }
}

const INITIAL_FEED: FeedPost[] = [
  {
    id: 'p1',
    handle: '@MKUU_ABAN',
    tribe: 'Karura Runners',
    avatar: '🏃',
    text: 'Just finished my 5AM Karura run. Consistency is the only hack.',
    streak: 2,
    minutesAgo: 10,
    salutes: 12,
    saluted: false,
  },
  {
    id: 'p2',
    handle: '@SAMANTHA_V',
    tribe: 'Mindful Morning',
    avatar: '🧘',
    text: 'Cold shower + 10 minutes of stillness before the matatu crush.',
    streak: 15,
    minutesAgo: 60,
    salutes: 8,
    saluted: false,
  },
  {
    id: 'p3',
    handle: '@NZOMO_K',
    tribe: 'Westlands Lifters',
    avatar: '💪',
    text: 'Locked KES 200 after completing my gym session. M-Pesa receipt incoming.',
    streak: 7,
    minutesAgo: 180,
    salutes: 5,
    saluted: false,
  },
]

const INITIAL_LEADERS: LeaderRow[] = [
  { handle: '@SAMANTHA_V', tribe: 'Health', avatar: '🧘', kes: 12400, streak: 15 },
  { handle: '@MKUU_ABAN', tribe: 'Fitness', avatar: '🏃', kes: 9800, streak: 2 },
  { handle: '@NZOMO_K', tribe: 'Fitness', avatar: '💪', kes: 7200, streak: 7 },
  { handle: '@AWINO', tribe: 'Lifestyle', avatar: '🌿', kes: 4100, streak: 4 },
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
  lines: ProtocolLine[]
  protocolError: string | null
  updateLine: (id: string, patch: Partial<ProtocolLine>) => void
  addLine: () => void
  cancelProtocol: () => void
  commitProtocol: () => void
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
}

const VunaContext = createContext<VunaState | null>(null)

export function VunaProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<TabId>('harvest')
  const [deposits, setDeposits] = useState(87.5)
  const [yieldEarned, setYieldEarned] = useState(8)
  const [tickingYield, setTickingYield] = useState(0.1641)
  const [lockMonths] = useState(12)
  const [daysRemaining] = useState(280)
  const [goalName] = useState('General Wealth')
  const [pillars, setPillars] = useState<Record<PillarId, number>>({
    FITNESS: 0,
    HEALTH: 0,
    HABITS: 0,
    LIFESTYLE: 0,
  })
  const [lines, setLines] = useState<ProtocolLine[]>([emptyLine()])
  const [protocolError, setProtocolError] = useState<string | null>(null)
  const [feed, setFeed] = useState<FeedPost[]>(INITIAL_FEED)
  const [pulseTab, setPulseTab] = useState<'feed' | 'leaderboard'>('feed')
  const [leaders] = useState<LeaderRow[]>(INITIAL_LEADERS)
  const [streak, setStreak] = useState(0)
  const [totalWins, setTotalWins] = useState(0)
  const [whatsappConnected, setWhatsappConnected] = useState(false)
  const [wrapEnabled, setWrapEnabled] = useState(true)
  const [giftNotice, setGiftNotice] = useState<string | null>(null)
  const [transfer, setTransfer] = useState<TransferState>({
    open: false,
    phone: '',
    amount: '',
    error: null,
    success: null,
  })

  useEffect(() => {
    const id = window.setInterval(() => {
      setTickingYield((v) => v + 0.0003)
      setYieldEarned((v) => v + 0.0003)
    }, 900)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!giftNotice) return
    const id = window.setTimeout(() => setGiftNotice(null), 2600)
    return () => window.clearTimeout(id)
  }, [giftNotice])

  const commitmentTotal = useMemo(
    () => lines.reduce((sum, line) => sum + parseKesInput(line.amount), 0),
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
    setLines([emptyLine()])
    setProtocolError(null)
  }, [])

  const commitProtocol = useCallback(() => {
    const ready = lines.filter((line) => parseKesInput(line.amount) > 0)
    if (ready.length === 0) {
      setProtocolError('Enter a KES amount to lock against a habit.')
      return
    }
    if (ready.some((line) => !line.pillar)) {
      setProtocolError('Select a pillar for each funded habit.')
      return
    }

    const added = ready.reduce((sum, line) => sum + parseKesInput(line.amount), 0)
    setDeposits((v) => v + added)
    setPillars((prev) => {
      const next = { ...prev }
      for (const line of ready) {
        if (line.pillar) next[line.pillar] += parseKesInput(line.amount)
      }
      return next
    })
    setTotalWins((v) => v + ready.length)
    setStreak((v) => v + 1)

    const first = ready[0]
    setFeed((prev) => [
      {
        id: uid(),
        handle: '@YOU',
        tribe: first.pillar
          ? `${first.pillar.charAt(0)}${first.pillar.slice(1).toLowerCase()} Tribe`
          : 'Vuna',
        avatar: '🌾',
        text: first.description.trim() || `Locked ${added.toFixed(2)} KES into protocol.`,
        streak: streak + 1,
        minutesAgo: 0,
        salutes: 0,
        saluted: false,
      },
      ...prev,
    ])
    setLines([emptyLine()])
    setProtocolError(null)
  }, [lines, streak])

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
    lines,
    protocolError,
    updateLine,
    addLine,
    cancelProtocol,
    commitProtocol,
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
  }

  return <VunaContext.Provider value={value}>{children}</VunaContext.Provider>
}

export function useVuna() {
  const ctx = useContext(VunaContext)
  if (!ctx) throw new Error('useVuna must be used inside VunaProvider')
  return ctx
}

