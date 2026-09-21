export function hasWindow(): boolean {
  return typeof globalThis !== 'undefined' && 'window' in globalThis
}

export function hasDocument(): boolean {
  return typeof globalThis !== 'undefined' && 'document' in globalThis
}

export function safeWindow(): (Window & typeof globalThis) | undefined {
  return hasWindow() ? (globalThis as unknown as Window & typeof globalThis) : undefined
}

export function safeDocument(): Document | undefined {
  return hasDocument() ? (globalThis as unknown as { document: Document }).document : undefined
}

export function later(fn: () => void, ms: number): () => void {
  const id = globalThis.setTimeout(fn, ms)
  return () => globalThis.clearTimeout(id)
}

export function every(fn: () => void, ms: number): () => void {
  const id = globalThis.setInterval(fn, ms)
  return () => globalThis.clearInterval(id)
}

/** Safaricom Mini App / webview back. Does not trap browser popstate. */
export function onHardwareBack(handler: () => boolean): () => void {
  const w = safeWindow()
  const d = safeDocument()
  if (!w) return () => {}

  const onBackButton = (event: Event) => {
    if (handler()) {
      event.preventDefault()
      event.stopPropagation()
    }
  }
  const onMessage = (event: MessageEvent) => {
    const data = event.data
    if (data === 'back' || (data && typeof data === 'object' && (data as { type?: string }).type === 'back')) {
      handler()
    }
  }

  w.addEventListener('message', onMessage)
  d?.addEventListener('backbutton', onBackButton)
  return () => {
    w.removeEventListener('message', onMessage)
    d?.removeEventListener('backbutton', onBackButton)
  }
}
