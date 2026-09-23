import assert from 'node:assert/strict'
import { test } from 'node:test'
import { claimInviteReward, listPublicTribes, publishTribe, referralBalance, resetReferralsForTests } from './referrals.ts'

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
