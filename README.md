# VUNA

VUNA is a Kenya-first habit lock app. You commit KES against atomic habits over M-Pesa rails, track a Behavioral Commitment Index, and share verified wins with your tribe.

This is a local, in-browser prototype. Balances, streaks, and transfers live in React state — no backend, no real M-Pesa settlement.

## Screens

- **Harvest** — protocol balance, quick habit lock entry, atomic pillars (Fitness, Health, Habits, Lifestyle)
- **Lock** — commitment index, General Wealth goal, estimated harvest, Vuna Transfer
- **Pulse** — tribe activity feed, salutes, Vuna Gifts, leaderboard
- **Profile** — verified streak, total wins, WhatsApp invite, Friday 18:00 auditor wrap

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
5. On Pulse, salute a win or send a KES 50 Vuna Gift (needs at least KES 50.00 in protocol).
6. On Profile, set your M-Pesa number, connect WhatsApp, and toggle the weekly wrap.
