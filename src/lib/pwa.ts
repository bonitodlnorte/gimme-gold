// Where the app is running: installed on the home screen or in a browser tab, and on which platform.

/** True inside the app added to the home screen (standalone), on iOS and Android alike. */
export function installed(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true
}

/** 'ios', 'android' or null on desktop. In development, ?instalar=ios|android previews it. */
export function platform(): 'ios' | 'android' | null {
  const forced = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('instalar') : null
  if (forced === 'ios' || forced === 'android') return forced
  const ua = navigator.userAgent
  // iPadOS reports itself as a Mac, but with touch.
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return null
}
