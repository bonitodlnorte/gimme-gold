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

// iOS sometimes leaves one of these steps pending for ever, with no error. Each gets a limit, and the error names
// the step, so a phone that cannot subscribe says where it stopped.
const STEP_MS = 12_000

function within<T>(promise: Promise<T>, step: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(`Tiempo agotado en: ${step}`)), STEP_MS)
    promise.then(
      (value) => (window.clearTimeout(timer), resolve(value)),
      (error) => (window.clearTimeout(timer), reject(error)),
    )
  })
}

async function subscribeOn(reg: ServiceWorkerRegistration, key: string): Promise<PushSubscription> {
  const existing = await within(reg.pushManager.getSubscription(), 'leer la suscripción')
  if (existing) return existing
  return within(reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key) }), 'suscribir el dispositivo')
}

/** Subscribes with the permission already granted. A stuck service worker is thrown away and tried once more. */
async function subscribeGranted(key: string): Promise<PushKeys> {
  let sub: PushSubscription
  try {
    sub = await subscribeOn(await within(registration(), 'arrancar el service worker'), key)
  } catch {
    const old = await navigator.serviceWorker.getRegistration('/')
    await old?.unregister()
    sub = await subscribeOn(await within(registration(), 'arrancar el service worker (2º intento)'), key)
  }
  await rememberStart()
  return toKeys(sub)
}

/** Asks for permission (must run from a tap) and subscribes. Returns null when she said no. */
export async function subscribePush(): Promise<PushKeys | null> {
  if (!VAPID_PUBLIC_KEY) throw new Error('Falta VITE_VAPID_PUBLIC_KEY')
  const permission = await within(Notification.requestPermission(), 'pedir el permiso')
  if (permission !== 'granted') return null
  return subscribeGranted(VAPID_PUBLIC_KEY)
}

/**
 * Subscribes again without asking, for a device that already said yes but whose subscription the system dropped
 * (iOS does that on its own). Returns null when it cannot, and never throws: it runs unprompted on opening the app.
 */
export async function resubscribePush(): Promise<PushKeys | null> {
  if (!VAPID_PUBLIC_KEY || !pushSupported() || pushPermission() !== 'granted') return null
  try {
    return await subscribeGranted(VAPID_PUBLIC_KEY)
  } catch {
    return null
  }
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
