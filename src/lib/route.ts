import { useEffect, useState } from 'react'
import { safeWindow } from './runtime'

export type VunaRoute = 'landing' | 'app'

export function isAppPath(pathname?: string) {
  const path = pathname ?? safeWindow()?.location.pathname ?? '/'
  return path === '/app' || path.startsWith('/app/')
}

export function appUrl() {
  const w = safeWindow()
  const join = w ? new URLSearchParams(w.location.search).get('join') : null
  return join ? `/app?join=${encodeURIComponent(join)}` : '/app'
}

export function goApp(replace = false) {
  const w = safeWindow()
  if (!w) return
  const url = appUrl()
  if (replace) w.history.replaceState({ vuna: 'app' }, '', url)
  else w.history.pushState({ vuna: 'app' }, '', url)
  w.dispatchEvent(new Event('vuna-route'))
}

export function useVunaRoute(): VunaRoute {
  const [route, setRoute] = useState<VunaRoute>(() => (isAppPath() ? 'app' : 'landing'))

  useEffect(() => {
    const w = safeWindow()
    if (!w) return
    const sync = () => setRoute(isAppPath() ? 'app' : 'landing')
    if (!isAppPath() && new URLSearchParams(w.location.search).get('join')) {
      goApp(true)
    }
    w.addEventListener('popstate', sync)
    w.addEventListener('vuna-route', sync)
    return () => {
      w.removeEventListener('popstate', sync)
      w.removeEventListener('vuna-route', sync)
    }
  }, [])

  return route
}
