/**
 * Notification architecture (Kenya-first)
 *
 * Channels
 * - WhatsApp: primary. Friday 18:00 wrap, streak at risk, Vuna Gift receipts.
 * - In-app: Pulse feed + lock prompts. Works offline.
 * - Web push: optional later for desktop; poor reach on cheap Androids vs WhatsApp.
 *
 * Flow once Supabase is live
 * 1. Profile stores wrapEnabled, phone (M-Pesa / WhatsApp), timezone Africa/Nairobi.
 * 2. A Supabase Edge Function on a cron (Friday 15:00 UTC = 18:00 EAT) selects users
 *    with wrapEnabled and a verified number.
 * 3. The function posts a summary (vunas, KES locked, tribe) to WhatsApp Cloud API
 *    or Africa's Talking. Never from the browser.
 * 4. In-app copy is written to a `notifications` table and read on Pulse/Profile.
 *
 * Do not send money or OTPs from the client. The browser only stores preference flags.
 */

export type NotifyChannel = 'whatsapp' | 'inapp' | 'push'

export type NotifyEvent =
  | { kind: 'friday_wrap' }
  | { kind: 'streak_risk'; hoursLeft: number }
  | { kind: 'tribe_salute'; handle: string }
  | { kind: 'mpesa_receipt'; kes: number }
  | { kind: 'stk_success'; activity: string; kes: number; posted: boolean }

export function describeNotify(event: NotifyEvent): string {
  if (event.kind === 'friday_wrap') return 'Weekly auditor wrap is due Friday 18:00.'
  if (event.kind === 'streak_risk') return `Streak at risk in ${event.hoursLeft}h.`
  if (event.kind === 'tribe_salute') return `${event.handle} saluted your vuna.`
  if (event.kind === 'stk_success') {
    return event.posted
      ? `Congratulations. ${event.activity} is locked at KES ${event.kes.toFixed(2)} and on Pulse.`
      : `Congratulations. ${event.activity} is locked at KES ${event.kes.toFixed(2)}.`
  }
  return `M-Pesa receipt for KES ${event.kes.toFixed(2)}.`
}
