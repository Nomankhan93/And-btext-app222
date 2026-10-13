export interface ReturnLocation {
  pathname: string
  search?: string
  hash?: string
}

const DEFAULT_RETURN_TO = '/dashboard'

export function protectedReturnTo(location: ReturnLocation): string {
  return `${location.pathname}${location.search ?? ''}${location.hash ?? ''}`
}

export function safeReturnTo(raw: string | null | undefined, fallback = DEFAULT_RETURN_TO): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) return fallback
  if (/\p{Cc}/u.test(raw)) return fallback

  try {
    const base = new URL('https://bulktext.invalid')
    const parsed = new URL(raw, base)
    if (parsed.origin !== base.origin) return fallback
    const target = `${parsed.pathname}${parsed.search}${parsed.hash}`
    if (parsed.pathname === '/auth' || parsed.pathname.startsWith('/auth/')) return fallback
    return target || fallback
  } catch {
    return fallback
  }
}
