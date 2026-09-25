/*
 * TREAD service worker.
 *
 * A saved trip has to open at a trailhead with no bars, and nothing may be
 * served as current when it is not. The app shell is cached; cross-origin
 * requests (forecasts, place search, map tiles) are never cached here, so a
 * stale forecast can never pose as a live one.
 */
const VERSION = 'tread-v1'
const SHELL = `${VERSION}-shell`
const ASSETS = `${VERSION}-assets`
const SCOPE = new URL(self.registration.scope)
const INDEX = new URL('./index.html', SCOPE).pathname

const PRECACHE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png', './icons/icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => Promise.all(PRECACHE.map((p) => cache.add(new Request(p, { cache: 'reload' })).catch(() => undefined))))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(SHELL).then((cache) => cache.put(INDEX, copy))
          return response
        })
        .catch(() => caches.match(INDEX).then((cached) => cached ?? caches.match('./'))),
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok && response.type === 'basic') {
            const copy = response.clone()
            caches.open(ASSETS).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(() => cached)
      return cached ?? network
    }),
  )
})
