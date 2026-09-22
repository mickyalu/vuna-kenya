const CACHE = 'vuna-shell-v2'

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return

  event.respondWith(
    fetch(req)
      .then((res) => {
        const cacheable =
          res.ok &&
          (req.mode === 'navigate' ||
            url.pathname.startsWith('/assets/') ||
            url.pathname.startsWith('/icons/') ||
            url.pathname === '/manifest.webmanifest')
        if (cacheable) {
          const copy = res.clone()
          void caches.open(CACHE).then((cache) => cache.put(req, copy))
        }
        return res
      })
      .catch(async () => {
        const cached = await caches.match(req)
        if (cached) return cached
        if (req.mode === 'navigate') {
          const shell = (await caches.match('/app')) || (await caches.match('/'))
          if (shell) return shell
        }
        return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } })
      }),
  )
})
