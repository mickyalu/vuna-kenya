# VUNA security audit — CMA sandbox & Daraja

Audit date: 20 September 2026. Scope: `/src`, `/server`, `/api`, `/shared`.

## Findings (before this refactor)

| Pillar | Issue | Severity |
| --- | --- | --- |
| Daraja STK | Goal balance credited on a client `setTimeout` after “Send STK”. No CheckoutRequestID, no callback, no poll. | Critical |
| Daraja STK | Amounts sent as KES decimals (`toFixed(2)`). Daraja Amount is an integer. | High |
| Daraja STK | MSISDN accepted as `07…` / `+254…` and stored raw. Daraja PartyA must be `254XXXXXXXXX`. | High |
| Secrets | No server. Any future Consumer Key / Secret / Passkey in `VITE_*` would ship in the browser bundle. | Critical |
| Idempotency | None. A replayed success would double-credit deposits and yield. | Critical |
| Anti-gaming | Habit composer incremented deposits, streak, and wins without a paid callback. | High |
| PII / DPA | `localStorage['vuna-mpesa']` held the raw number. ErrorBoundary logged component stacks. | High |
| PIN | Copy said “Waiting for PIN…” as if VUNA collected it. PIN stays on the Safaricom prompt. | Medium |
| Persistence | Closing the app during the 1.1s mock timer dropped the lock. Reload did not resume. | High |
| Mini App | `window`, `document`, `localStorage` used unguarded. No webview back handling for the dock. | Medium |
| Transfer | UI claimed “M-Pesa request sent” and debited protocol with no B2C API. | High |

## Fixes applied

1. **STK lifecycle** — `POST /api/stk/push` → pending UI + poll `GET /api/stk/status` → `POST /api/stk/callback` applies ResultCode. Deposits and gift wallet change **only** when `ResultCode === 0` and the ledger has not already credited that CheckoutRequestID / MpesaReceiptNumber.
2. **Server secrets** — Daraja lives in `server/daraja.ts`. Keys are `DARAJA_*` (never `VITE_`). Missing keys run a mock callback so CMA review and Mini App QA still work.
3. **MSISDN & KES** — `shared/phone.ts` emits `2547XXXXXXXX`. `shared/kes.ts` rounds to a whole shilling (min 1, max 150000).
4. **Idempotency** — `server/ledger.ts` is an append-only transaction log (`timestamp`, `habitId`, `amountKes`, `checkoutRequestId`, `mpesaReceipt`, `status`). Client `vuna-credits` is a second check.
5. **Rate limit** — 5 STK pushes / MSISDN / 60s and one in-flight prompt per number.
6. **PII** — Device stores `2547****1234` only. HttpOnly `vuna_sid` cookie holds the session MSISDN on the server. Logs run through `maskInText`. PIN is never accepted as a field.
7. **Reload** — `vuna-pending-stk` (CheckoutRequestID, no phone) is restored on boot and polled until terminal.
8. **Mini App** — `src/lib/runtime.ts` and memory-backed storage. Hardware / webview back closes sheets then returns to Harvest before leaving the webview.
9. **Transfer** — Honest sandbox copy. No fake B2C debit.
10. **Yield** — Cosmetic tick runs only after a confirmed lock callback.

## Remaining gaps (production)

- Ledger is in-process + `.data/vuna-ledger.json`. CMA production needs Postgres (or Supabase) with row-level audit, not a lambda memory map.
- Live Daraja needs a public HTTPS `DARAJA_CALLBACK_URL` allow-listed by Safaricom.
- B2C / payout is not implemented.
- Supabase auth, when added, must use HttpOnly cookies via Edge Functions — never `localStorage` refresh tokens.
- Mock mode must be off (`DARAJA_*` set, `VUNA_STK_MOCK` unset) before handling real KES.
