/* BulkText Web 0.18.8 service worker.
 * Safety boundary: cache only the same-origin app shell and static assets.
 * Supabase/auth/queue/delivery/gateway requests are never cached or replayed.
 */
const VERSION = '0.18.8'
const CACHE_PREFIX = 'bulktext-pwa-'
const SHELL_CACHE = `${CACHE_PREFIX}shell-${VERSION}`
const RUNTIME_CACHE = `${CACHE_PREFIX}runtime-${VERSION}`
const APP_SHELL = '/'
const OFFLINE_FALLBACK = '/offline.html'
const PRECACHE_URLS = [
  APP_SHELL,
  OFFLINE_FALLBACK,
  '/manifest.webmanifest',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
]

async function precacheAppShell() {
  const cache = await caches.open(SHELL_CACHE)
  const shellResponse = await fetch(APP_SHELL, { cache: 'reload' })
  if (!shellResponse.ok) throw new Error(`App shell request failed: ${shellResponse.status}`)

  const shellHtml = await shellResponse.clone().text()
  const buildAssets = [...shellHtml.matchAll(/(?:src|href)=["'](\/assets\/[^"']+)["']/g)].map((match) => match[1])
  await cache.put(APP_SHELL, shellResponse)
  await Promise.all([...new Set([...PRECACHE_URLS.filter((url) => url !== APP_SHELL), ...buildAssets])].map(async (url) => {
    const response = await fetch(url, { cache: 'reload' })
    if (response.ok) await cache.put(url, response)
  }))
}

self.addEventListener('install', (event) => {
  event.waitUntil(precacheAppShell())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== SHELL_CACHE && key !== RUNTIME_CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') void self.skipWaiting()
})

function isStaticAsset(url) {
  return url.pathname.startsWith('/assets/')
    || url.pathname.startsWith('/icons/')
    || url.pathname.startsWith('/branding/')
    || url.pathname === '/manifest.webmanifest'
    || url.pathname === '/favicon.ico'
    || url.pathname.startsWith('/favicon-')
    || url.pathname === '/apple-touch-icon.png'
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(SHELL_CACHE)
  try {
    const response = await fetch(request)
    if (response.ok && response.type === 'basic') await cache.put(APP_SHELL, response.clone())
    return response
  } catch {
    return (await cache.match(APP_SHELL)) || (await cache.match(OFFLINE_FALLBACK)) || Response.error()
  }
}

async function cacheFirstStatic(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  const cache = await caches.open(RUNTIME_CACHE)
  const response = await fetch(request)
  if (response.ok && response.type === 'basic') await cache.put(request, response.clone())
  return response
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request))
    return
  }

  if (isStaticAsset(url)) event.respondWith(cacheFirstStatic(request))
})
