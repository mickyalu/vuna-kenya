import { maskInText } from '../shared/mask.ts'

function safeConsole(): Pick<Console, 'info' | 'warn' | 'error'> | null {
  return typeof console === 'undefined' ? null : console
}

export function logInfo(message: string, extra?: string) {
  safeConsole()?.info('[vuna]', maskInText(message), extra ? maskInText(extra) : '')
}

export function logWarn(message: string, extra?: string) {
  safeConsole()?.warn('[vuna]', maskInText(message), extra ? maskInText(extra) : '')
}

export function logError(message: string) {
  safeConsole()?.error('[vuna]', maskInText(message))
}
