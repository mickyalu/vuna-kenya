import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { INVITE_REWARD_KES } from '../src/lib/invite.ts'
import { normalizeRecipientHandle } from '../src/lib/gift.ts'
import { logInfo } from './log.ts'

const FILE = join(process.cwd(), '.data', 'vuna-referrals.json')

export type ReferralCredit = {
  id: string
  inviterHandle: string
  inviteeId: string
  clubSlug: string
  amountKes: number
  createdAt: string
}

type Store = { credits: ReferralCredit[]; tribes: PublicTribe[] }

export type PublicTribe = {
  slug: string
  name: string
  line: string
  live: number
  pillar: string
  vertical: string
  access: 'public' | 'private'
}

function empty(): Store {
  return { credits: [], tribes: [] }
}

function load(): Store {
  try {
    const parsed = JSON.parse(readFileSync(FILE, 'utf8')) as Store
    return { credits: parsed.credits ?? [], tribes: parsed.tribes ?? [] }
  } catch {
    return empty()
  }
}

function save(data: Store) {
  try {
    mkdirSync(dirname(FILE), { recursive: true })
    writeFileSync(FILE, JSON.stringify(data), 'utf8')
  } catch {
    try {
      writeFileSync('/tmp/vuna-referrals.json', JSON.stringify(data), 'utf8')
    } catch {
      /* serverless disk */
    }
  }
}

export function resetReferralsForTests() {
  save(empty())
}

export function publishTribe(tribe: PublicTribe) {
  const slug = tribe.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40)
  const name = tribe.name.trim().slice(0, 60)
  if (!slug || !name) return null
  const data = load()
  const vertical = (tribe.vertical || '').trim().replace(/\s+/g, ' ').slice(0, 40)
  const next: PublicTribe = {
    slug,
    name,
    line: tribe.line.trim().slice(0, 140) || vertical || 'A VUNA circle.',
    live: Number.isFinite(tribe.live) ? Math.max(1, Math.round(tribe.live)) : 1,
    pillar: tribe.pillar.trim().slice(0, 32) || 'FITNESS',
    vertical,
    access: tribe.access === 'private' ? 'private' : 'public',
  }
  data.tribes = [next, ...data.tribes.filter((item) => item.slug !== slug)]
  save(data)
  return next
}

export function findPublishedTribe(slug: string) {
  const key = slug.trim().toLowerCase()
  return load().tribes.find((item) => item.slug === key) ?? null
}

export function listPublicTribes() {
  return load().tribes.filter((item) => item.access !== 'private')
}

function supabaseReady() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

async function insertReferralGift(credit: ReferralCredit): Promise<'stored' | 'duplicate' | 'unavailable'> {
  if (!supabaseReady()) return 'unavailable'
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/gifts`, {
    method: 'POST',
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      recipient_handle: credit.inviterHandle,
      sender_profile_id: null,
      recipient_profile_id: null,
      amount_kes: credit.amountKes,
      checkout_request_id: credit.id,
      mpesa_receipt: null,
      status: 'success',
      occurred_at: credit.createdAt,
    }),
  })
  if (res.status === 409) return 'duplicate'
  if (!res.ok) return 'unavailable'
  return 'stored'
}

export async function claimInviteReward(input: {
  inviterHandle: string
  inviteeId: string
  inviteeHandle?: string | null
  clubSlug: string
}) {
  const inviter = normalizeRecipientHandle(input.inviterHandle)
  const inviteeId = input.inviteeId.trim().slice(0, 80)
  if (!inviter || inviteeId.length < 8) return { credited: false as const, reason: 'invalid', amountKes: 0 }
  const invitee = input.inviteeHandle ? normalizeRecipientHandle(input.inviteeHandle) : null
  if (invitee && invitee.toLowerCase() === inviter.toLowerCase()) {
    return { credited: false as const, reason: 'self', amountKes: 0 }
  }
  const data = load()
  if (data.credits.some((row) => row.inviteeId === inviteeId)) {
    return { credited: false as const, reason: 'already', amountKes: 0, inviterHandle: inviter }
  }
  const credit: ReferralCredit = {
    id: `ref_${inviteeId}`,
    inviterHandle: inviter,
    inviteeId,
    clubSlug: input.clubSlug.trim().slice(0, 40),
    amountKes: INVITE_REWARD_KES,
    createdAt: new Date().toISOString(),
  }
  const stored = await insertReferralGift(credit)
  if (stored === 'duplicate') {
    return { credited: false as const, reason: 'already', amountKes: 0, inviterHandle: inviter }
  }
  data.credits.push(credit)
  save(data)
  if (stored === 'unavailable') logInfo('invite reward kept locally — apply 003_gifts.sql', inviter)
  else logInfo('invite reward stored', inviter)
  return { credited: true as const, amountKes: INVITE_REWARD_KES, inviterHandle: inviter }
}

export async function referralBalance(handle: string) {
  const inviter = normalizeRecipientHandle(handle)
  if (!inviter) return { totalKes: 0, credits: [] as ReferralCredit[] }
  const local = load().credits.filter((row) => row.inviterHandle.toLowerCase() === inviter.toLowerCase())
  if (!supabaseReady()) {
    return {
      totalKes: local.reduce((sum, row) => sum + row.amountKes, 0),
      credits: local,
    }
  }
  try {
    const filter = encodeURIComponent(inviter)
    const bare = encodeURIComponent(inviter.replace(/^@/, ''))
    const res = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/gifts?or=(recipient_handle.eq.${filter},recipient_handle.eq.${bare})&checkout_request_id=like.ref_*&select=checkout_request_id,amount_kes,occurred_at,recipient_handle`,
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      },
    )
    if (!res.ok) throw new Error('referrals unavailable')
    const rows = (await res.json()) as { checkout_request_id: string; amount_kes: number; occurred_at: string }[]
    const credits = rows.map((row) => ({
      id: row.checkout_request_id,
      inviterHandle: inviter,
      inviteeId: row.checkout_request_id.replace(/^ref_/, ''),
      clubSlug: '',
      amountKes: row.amount_kes,
      createdAt: row.occurred_at,
    }))
    const seen = new Set(credits.map((row) => row.id))
    for (const row of local) {
      if (!seen.has(row.id)) credits.push(row)
    }
    return { totalKes: credits.reduce((sum, row) => sum + row.amountKes, 0), credits }
  } catch {
    return {
      totalKes: local.reduce((sum, row) => sum + row.amountKes, 0),
      credits: local,
    }
  }
}
