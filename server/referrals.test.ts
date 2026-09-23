import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  claimInviteReward,
  joinTribeRoster,
  listPublicTribes,
  publishTribe,
  referralBalance,
  resetReferralsForTests,
  tribeRoster,
} from './referrals.ts'

test('a friend joining once puts KES 100 on the inviter gift wallet', async () => {
  resetReferralsForTests()
  const first = await claimInviteReward({
    inviterHandle: 'Michael.A',
    inviteeId: 'device-invitee-001',
    inviteeHandle: 'Amina.K',
    clubSlug: '5am-club',
  })
  assert.equal(first.credited, true)
  assert.equal(first.amountKes, 100)
  assert.equal(first.inviterHandle, '@Michael.A')
  const again = await claimInviteReward({
    inviterHandle: '@Michael.A',
    inviteeId: 'device-invitee-001',
    clubSlug: '5am-club',
  })
  assert.equal(again.credited, false)
  const balance = await referralBalance('Michael.A')
  assert.equal(balance.totalKes, 100)
  assert.equal(balance.credits.length, 1)
})

test('opening your own invite does not pay you', async () => {
  resetReferralsForTests()
  const result = await claimInviteReward({
    inviterHandle: '@Michael.A',
    inviteeId: 'device-self-0001',
    inviteeHandle: 'Michael.A',
    clubSlug: '5am-club',
  })
  assert.equal(result.credited, false)
  assert.equal(result.reason, 'self')
  assert.equal((await referralBalance('@Michael.A')).totalKes, 0)
})

test('a public circle is listed and a private circle stays on the invite link', () => {
  resetReferralsForTests()
  publishTribe({
    slug: 'saturday-kitchen',
    name: 'Saturday Kitchen',
    line: 'Cook before the week starts.',
    live: 1,
    pillar: 'LIFESTYLE',
    vertical: 'Meal prep',
    access: 'public',
  })
  publishTribe({
    slug: 'dawn-loop',
    name: 'Dawn Loop',
    line: 'Karura before the city wakes.',
    live: 1,
    pillar: 'FITNESS',
    vertical: 'Morning run',
    access: 'private',
  })
  const listed = listPublicTribes()
  assert.equal(listed.some((tribe) => tribe.slug === 'saturday-kitchen' && tribe.vertical === 'Meal prep'), true)
  assert.equal(listed.some((tribe) => tribe.slug === 'dawn-loop'), false)
})

test('a saved profile joins the tribe once and a sample photo URL is refused', async () => {
  resetReferralsForTests()
  const first = await joinTribeRoster({
    slug: '5am-club',
    handle: 'Amina.K',
    name: 'Amina.K',
    photo: '/faces/otieno.jpg',
  })
  assert.equal(first?.name, 'Amina.K')
  assert.equal(first?.handle, '@Amina.K')
  const updated = await joinTribeRoster({
    slug: '5am-club',
    handle: '@Amina.K',
    name: 'Amina.K',
    photo: '/faces/amina.jpg',
  })
  assert.equal(updated?.photo, '/faces/amina.jpg')
  await joinTribeRoster({
    slug: '5am-club',
    handle: 'Wanjiku.N',
    name: 'Wanjiku.N',
    photo: '/faces/zuri.jpg',
  })
  const roster = await tribeRoster('5am-club')
  assert.equal(roster.length, 2)
  assert.equal(roster.some((member) => member.name === 'Amina.K' && member.photo === '/faces/amina.jpg'), true)
  assert.equal(roster.some((member) => member.name === 'Wanjiku.N'), true)
  assert.equal(
    await joinTribeRoster({ slug: '5am-club', handle: 'Amina.K', name: ' ', photo: '/faces/otieno.jpg' }),
    null,
  )
  assert.equal(
    await joinTribeRoster({
      slug: '5am-club',
      handle: 'Amina.K',
      name: 'Amina.K',
      photo: 'https://example.com/face.jpg',
    }),
    null,
  )
  assert.equal((await tribeRoster('5am-club')).length, 2)
})
