import { useCallback, useEffect, useState } from 'react'
import { safeWindow } from './runtime'

type BeforeInstall = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
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
    const w = safeWindow()
    if (!w) return
    registerVunaWorker()

    const onPrompt = (event: Event) => {
      event.preventDefault()
      setDeferred(event as BeforeInstall)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferred(null)
      setHint(null)
    }
    w.addEventListener('beforeinstallprompt', onPrompt)
    w.addEventListener('appinstalled', onInstalled)
    return () => {
      w.removeEventListener('beforeinstallprompt', onPrompt)
      w.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = useCallback(async () => {
    if (deferred) {
      await deferred.prompt()
      const choice = await deferred.userChoice
      setDeferred(null)
      if (choice.outcome === 'accepted') setInstalled(true)
      return
    }
    setHint('Open the browser menu and tap Add to Home Screen. VUNA then launches as an app on /app.')
  }, [deferred])

  return { install, installed, hint, canPrompt: Boolean(deferred) }
}
