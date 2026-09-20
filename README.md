# VUNA

VUNA is a Kenya-first habit lock app. You commit KES against atomic habits over M-Pesa rails, track a Behavioral Commitment Index, and share verified wins with your tribe.

This is a local, in-browser prototype. Balances, streaks, and transfers live in React state — no backend, no real M-Pesa settlement.

## Screens

- **Harvest** — protocol balance, quick habit lock entry, atomic pillars (Fitness, Health, Habits, Lifestyle)
- **Lock** — commitment index, General Wealth goal, estimated harvest, Vuna Transfer
- **Pulse** — tribe activity feed, salutes, Vuna Gifts, leaderboard
- **Profile** — name on the card, gift wallet, tribes (join, create, invite), WhatsApp, Friday wrap, Contact / Terms / Opt out

All money is shown in **KES**.

## Run locally

```bash
npm install
npm run dev
```

The Vite server binds to `http://127.0.0.1:43173`.

## Stack

React 19, TypeScript, Vite, Tailwind CSS, Lucide icons.

## How to try it

1. On Harvest, tap a pillar (Health, Fitness, …) and pick an activity — or type one at the bottom of the sheet.
2. The lock sheet opens immediately: amount, optional caption, Post to Pulse toggle, then Send STK.
3. After the demo PIN, a congratulations notice lands at the top. If Pulse was on, the lock is already on the feed.
4. Open Lock to see deposits and remaining time. Use Vuna Transfer with a Safaricom number (`07XXXXXXXX` or `+2547XXXXXXXX`).
5. On Pulse, salute a win or tap Vuna Gift — pick 10, 20 or 50. That STK hits VUNA paybill `400200`, not protocol. The gift lands live on their Pulse; they can reply and you get a notice.
6. The bell (top right) keeps every notice. Tap a toast or the bell if you missed it.
7. On Profile, set your M-Pesa number. Gift wallet is paybill credits, separate from lock.
8. Tribes live on Profile. Join a catalog circle, sit in one, or Create and send the invite link (clipboard + WhatsApp, like a Strava club). Opening `?join=5am-club` auto-joins.
9. Account on Profile opens Contact us, Terms and conditions, and Opt out (leave tribes, wrap off, erase this device).
