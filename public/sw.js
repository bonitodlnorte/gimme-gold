// Service worker for push notifications only. It caches nothing: the app always loads fresh from the
// network, so a stale cache can never show an old version. api/avisos.ts sends the payload as JSON
// { title, body, icon, tag }. Tapping a notification opens the page the device subscribed from (her app, or
// his link): src/lib/push.ts leaves that path in the cache under START, since a partner has no account to look it up by.

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { body: event.data ? event.data.text() : '' }
  }
  const title = data.title || 'Gimme Gold'
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || '',
      icon: data.icon || '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: data.tag || 'gimme-gold',
      renotify: true,
    }),
  )
})

const CACHE = 'gimme-gold-avisos'
const START = '/__inicio'

async function startPath() {
  try {
    const cache = await caches.open(CACHE)
    const saved = await cache.match(START)
    return saved ? await saved.text() : '/'
  } catch {
    return '/'
  }
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      const open = windows.find((w) => 'focus' in w)
      if (open) return open.focus()
      return self.clients.openWindow(await startPath())
    })(),
  )
})

// Take over right away, so the first launch after installing can subscribe without a reload.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))
