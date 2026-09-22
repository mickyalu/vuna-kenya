import { useCallback, useEffect, useState } from 'react'
import { installInstructions } from './install-help'
import { safeWindow } from './runtime'

export type BeforeInstall = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type InstallWindow = Window & {
  __vunaInstall?: BeforeInstall | null
  __vunaInstallBound?: boolean
}

export function captureInstallPrompt() {
  const w = window as InstallWindow
  if (w.__vunaInstallBound) return
  w.__vunaInstallBound = true
  w.__vunaInstall = w.__vunaInstall ?? null
  w.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    w.__vunaInstall = event as BeforeInstall
    w.dispatchEvent(new Event('vuna-install-ready'))
  })
}

export function registerVunaWorker() {
  const w = safeWindow()
  if (!w || !('serviceWorker' in w.navigator)) return
  void w.navigator.serviceWorker.register('/sw.js').catch(() => {})
}

function isStandalone() {
  const w = safeWindow()
  if (!w) return false
  return (
    w.matchMedia('(display-mode: standalone)').matches ||
    Boolean((w.navigator as Navigator & { standalone?: boolean }).standalone)
  )
}

export function usePwaInstall() {
  const [deferred, setDeferred] = useState<BeforeInstall | null>(null)
  const [installed, setInstalled] = useState(isStandalone)
  const [hint, setHint] = useState<string | null>(null)

  useEffect(() => {
    const w = safeWindow() as InstallWindow | null
    if (!w) return
    registerVunaWorker()
    setDeferred(w.__vunaInstall ?? null)

    const onReady = () => setDeferred(w.__vunaInstall ?? null)
    const onInstalled = () => {
      setInstalled(true)
      w.__vunaInstall = null
      setDeferred(null)
      setHint(null)
    }
    w.addEventListener('vuna-install-ready', onReady)
    w.addEventListener('appinstalled', onInstalled)
    return () => {
      w.removeEventListener('vuna-install-ready', onReady)
      w.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = useCallback(async () => {
    const w = safeWindow() as InstallWindow | null
    const promptEvent = deferred ?? w?.__vunaInstall ?? null
    if (promptEvent) {
      await promptEvent.prompt()
      const choice = await promptEvent.userChoice
      if (w) w.__vunaInstall = null
      setDeferred(null)
      if (choice.outcome === 'accepted') {
        setInstalled(true)
        setHint(null)
      }
      return
    }
    setHint(installInstructions(w?.navigator.userAgent ?? ''))
  }, [deferred])

  const dismissHint = useCallback(() => setHint(null), [])

  return { install, installed, hint, dismissHint, canPrompt: Boolean(deferred) }
}
