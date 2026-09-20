/**
 * Notification architecture (Kenya-first)
 *
 * Channels
 * - WhatsApp: primary. Friday 18:00 wrap, streak at risk, Vuna Gift receipts.
 * - In-app: bell + toast + inbox. Works offline. This is what the phone shows now.
 * - Web push: optional later for desktop; poor reach on cheap Androids vs WhatsApp.
 *
 * Vuna Gift is not a protocol lock
 * 1. Sender picks 10 / 20 / 50. Money never leaves protocol deposits.
 * 2. Daraja STK Push (C2B) to VUNA paybill 400200, account = recipient handle.
 * 3. Paybill webhook credits recipient.gift_wallet on their profile.
 * 4. Realtime insert on Pulse (gift card: from, amount). Recipient can reply.
 * 5. Reply writes an in-app + WhatsApp notice back to the sender.
 *
 * Do not send money or OTPs from the client. The browser only mocks STK and stores flags.
 */

export type NotifyChannel = 'whatsapp' | 'inapp' | 'push'

export type NotifyEvent =
  | { kind: 'friday_wrap' }
  | { kind: 'streak_risk'; hoursLeft: number }
  | { kind: 'tribe_salute'; handle: string }
  | { kind: 'mpesa_receipt'; kes: number }
  | { kind: 'stk_success'; activity: string; kes: number; posted: boolean }
  | { kind: 'gift_sent'; handle: string; kes: number }
  | { kind: 'gift_in'; handle: string; kes: number }
  | { kind: 'gift_reply'; handle: string; text: string }

export function describeNotify(event: NotifyEvent): string {
  if (event.kind === 'friday_wrap') return 'Weekly auditor wrap is due Friday 18:00.'
  if (event.kind === 'streak_risk') return `Streak at risk in ${event.hoursLeft}h.`
  if (event.kind === 'tribe_salute') return `${event.handle} saluted your vuna.`
  if (event.kind === 'stk_success') {
    return event.posted
      ? `Congratulations. ${event.activity} is locked at KES ${event.kes.toFixed(2)} and on Pulse.`
      : `Congratulations. ${event.activity} is locked at KES ${event.kes.toFixed(2)}.`
  }
  if (event.kind === 'gift_sent') {
    return `Paybill credited ${event.handle} with KES ${event.kes.toFixed(2)}. Live on their Pulse.`
  }
  if (event.kind === 'gift_in') {
    return `${event.handle} sent you KES ${event.kes.toFixed(2)}. On your Pulse — reply from there.`
  }
  if (event.kind === 'gift_reply') {
    return `${event.handle}: ${event.text}`
  }
  return `M-Pesa receipt for KES ${event.kes.toFixed(2)}.`
}
