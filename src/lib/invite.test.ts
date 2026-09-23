import assert from 'node:assert/strict'
import { test } from 'node:test'
import { inviteLink, inviteMessage, renderJoinPage } from './invite.ts'

const club = {
  name: '5AM Club',
  line: 'Karura before the city wakes.',
  live: 3,
  inviteSlug: '5am-club',
}

test('invite copy names the tribe and gives a reason to sit', () => {
  const text = inviteMessage(club, 'Michael.A')
  assert.match(text, /Michael\.A kept you a seat in 5AM Club/)
  assert.match(text, /Karura before the city wakes/)
  assert.match(text, /3 people are already there/)
  assert.match(text, /Come lock one habit with us/)
  assert.doesNotMatch(text, /we lock KES against habits/)
})

test('the invite link is a join page with the inviter attached', () => {
  const url = inviteLink('https://vuna-kenya.vercel.app', '5am-club', 'Michael.A')
  assert.equal(url, 'https://vuna-kenya.vercel.app/join/5am-club?ref=Michael.A')
})

test('the join page carries a WhatsApp image and one join button', () => {
  const html = renderJoinPage({
    origin: 'https://vuna-kenya.vercel.app',
    slug: '5am-club',
    club,
    ref: 'Michael.A',
  })
  assert.match(html, /og:image" content="https:\/\/vuna-kenya\.vercel\.app\/og\/vuna-invite\.png"/)
  assert.match(html, /Sit with 5AM Club/)
  assert.match(html, /Join 5AM Club/)
  assert.match(html, /You sit with them on Harvest/)
  assert.match(html, /join=5am-club/)
  assert.match(html, /ref=Michael\.A/)
  assert.match(html, /ready=1/)
})
