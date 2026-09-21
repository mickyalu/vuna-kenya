import { useEffect, useState } from 'react'
import { safeDocument, safeWindow } from './runtime.ts'

export type VunaRoute = 'landing' | 'app'

const SPA_HOP_KEY = 'vuna-spa-hop'
let pendingLandingScroll: 'top' | string = 'top'
let spaHop = false
let enteredApp = false

export function isAppPath(pathname?: string, hash?: string) {
  const w = safeWindow()
  const path = pathname ?? w?.location.pathname ?? '/'
  const fragment = hash ?? w?.location.hash ?? ''
  return path === '/app' || path.startsWith('/app/') || fragment === '#/app' || fragment.startsWith('#/app/')
}

export function appUrl() {
  const w = safeWindow()
  const join = w ? new URLSearchParams(w.location.search).get('join') : null
  return join ? `/app?join=${encodeURIComponent(join)}` : '/app'
}

export function releaseScrollLock() {
  const d = safeDocument()
  if (!d) return
  d.body.style.overflow = ''
  d.documentElement.style.overflow = ''
}

export function markSpaHop() {
  spaHop = true
  try {
    safeWindow()?.sessionStorage.setItem(SPA_HOP_KEY, '1')
  } catch {
    /* private mode */
  }
}

export function shouldSkipAppSplash() {
  if (enteredApp || spaHop) return true
  try {
    return safeWindow()?.sessionStorage.getItem(SPA_HOP_KEY) === '1'
  } catch {
    return false
  }
}

export function markAppEntered() {
  enteredApp = true
  spaHop = false
  try {
    safeWindow()?.sessionStorage.removeItem(SPA_HOP_KEY)
  } catch {
    /* private mode */
  }
}

function notifyRoute() {
  safeWindow()?.dispatchEvent(new Event('vuna-route'))
}

export function isModifiedClick(event: {
  metaKey: boolean
  ctrlKey: boolean
  shiftKey: boolean
  altKey: boolean
  button?: number
}) {
  return Boolean(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button === 1)
}

export function goApp(replace = false) {
  const w = safeWindow()
  if (!w) return
  releaseScrollLock()
  markSpaHop()
  pendingLandingScroll = 'top'
  if (isAppPath()) {
    notifyRoute()
    return
  }
  const url = appUrl()
  if (replace) w.history.replaceState({ vuna: 'app' }, '', url)
  else w.history.pushState({ vuna: 'app' }, '', url)
  notifyRoute()
}

export function goLanding(replace = false) {
  const w = safeWindow()
  if (!w) return
  releaseScrollLock()
  pendingLandingScroll = 'top'
  if (!isAppPath()) {
    if (w.location.hash) w.history.replaceState({ vuna: 'landing' }, '', '/')
    w.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  if (replace) w.history.replaceState({ vuna: 'landing' }, '', '/')
  else w.history.pushState({ vuna: 'landing' }, '', '/')
  notifyRoute()
}

export function goSection(id: string) {
  const w = safeWindow()
  if (!w) return
  const clean = id.replace(/^#/, '')
  pendingLandingScroll = clean
  if (isAppPath()) {
    releaseScrollLock()
    w.history.pushState({ vuna: 'landing' }, '', `/#${clean}`)
    notifyRoute()
    return
  }
  w.history.replaceState({ vuna: 'landing' }, '', `/#${clean}`)
  scrollToId(clean)
}

export function scrollToId(id: string) {
  const d = safeDocument()
  const w = safeWindow()
  const el = d?.getElementById(id)
  if (!el) {
    w?.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function applyPendingLandingScroll() {
  const w = safeWindow()
  const hash = (w?.location.hash ?? '').replace(/^#/, '')
  const target = pendingLandingScroll !== 'top' ? pendingLandingScroll : hash
  pendingLandingScroll = 'top'
  if (!target || target.startsWith('/')) {
    w?.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  w?.requestAnimationFrame(() => scrollToId(target))
}

export function syncViewport(route: VunaRoute) {
  const d = safeDocument()
  if (!d) return
  d.documentElement.classList.toggle('vuna-app', route === 'app')
  d.documentElement.classList.toggle('vuna-landing', route === 'landing')
  if (route === 'app') {
    d.body.style.overflow = 'hidden'
    d.documentElement.style.overflow = 'hidden'
  } else {
    releaseScrollLock()
  }
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
