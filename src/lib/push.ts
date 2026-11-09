// Web Push on the device: the service worker, the permission and the browser's subscription.
// Saving the subscription in Supabase is the store's job (data/store.ts). On iOS this only works
// inside the app added to the home screen (16.4+), and the permission must be asked from a tap.

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

export interface PushKeys {
  endpoint: string
  p256dh: string
  auth: string
}

/** Whether this browser can receive push at all. Not whether it is allowed to. */
export function pushSupported(): boolean {
  return Boolean(VAPID_PUBLIC_KEY) && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

export function pushPermission(): NotificationPermission | null {
  return 'Notification' in window ? Notification.permission : null
}

async function registration(): Promise<ServiceWorkerRegistration> {
  const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
  await navigator.serviceWorker.ready
  return reg
}

function toKeys(sub: PushSubscription): PushKeys {
  const json = sub.toJSON()
  const p256dh = json.keys?.p256dh
  const auth = json.keys?.auth
  if (!json.endpoint || !p256dh || !auth) throw new Error('Suscripción incompleta')
  return { endpoint: json.endpoint, p256dh, auth }
}

/** The subscription this device already has, if any. */
export async function currentPush(): Promise<PushKeys | null> {
  if (!pushSupported()) return null
  try {
    const reg = await navigator.serviceWorker.getRegistration('/')
    const sub = await reg?.pushManager.getSubscription()
    return sub ? toKeys(sub) : null
  } catch {
    return null
  }
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'))
  const bytes = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)
  return bytes
}

// Where a tapped notification opens: the page this device subscribed from. Her app is at '/', the partner's at
// his link, which only exists in his browser, so the service worker reads it from here (public/sw.js).
const CACHE = 'gimme-gold-avisos'
const START = '/__inicio'

async function rememberStart(): Promise<void> {
  try {
    const cache = await caches.open(CACHE)
    await cache.put(START, new Response(window.location.pathname))
  } catch {
    // Without it the notification opens '/', which is right for her anyway.
  }
}

/** Asks for permission (must run from a tap) and subscribes. Returns null when she said no. */
export async function subscribePush(): Promise<PushKeys | null> {
  if (!VAPID_PUBLIC_KEY) throw new Error('Falta VITE_VAPID_PUBLIC_KEY')
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null
  const reg = await registration()
  const existing = await reg.pushManager.getSubscription()
  const sub =
    existing ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) }))
  await rememberStart()
  return toKeys(sub)
}

/** Drops the browser's subscription. Returns the endpoint it had, to delete it from Supabase too. */
export async function unsubscribePush(): Promise<string | null> {
  const reg = await navigator.serviceWorker.getRegistration('/')
  const sub = await reg?.pushManager.getSubscription()
  if (!sub) return null
  const endpoint = sub.endpoint
  await sub.unsubscribe()
  return endpoint
}
