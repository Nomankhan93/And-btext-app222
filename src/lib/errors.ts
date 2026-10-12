interface SupabaseLikeError {
  name?: unknown
  message?: unknown
  details?: unknown
  hint?: unknown
  code?: unknown
  status?: unknown
  statusCode?: unknown
}

export interface ErrorDiagnosticContext {
  name: string | null
  message: string | null
  details: string | null
  hint: string | null
  code: string | null
  status: string | null
}

function nonEmptyText(value: unknown): string | null {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (typeof value !== 'string') return null
  const text = value.trim()
  return text ? text : null
}

export function errorDiagnosticContext(reason: unknown): ErrorDiagnosticContext {
  if (reason instanceof Error) {
    const candidate = reason as Error & SupabaseLikeError
    return {
      name: nonEmptyText(candidate.name),
      message: nonEmptyText(candidate.message),
      details: nonEmptyText(candidate.details),
      hint: nonEmptyText(candidate.hint),
      code: nonEmptyText(candidate.code),
      status: nonEmptyText(candidate.status ?? candidate.statusCode),
    }
  }

  if (reason && typeof reason === 'object') {
    const candidate = reason as SupabaseLikeError
    return {
      name: nonEmptyText(candidate.name),
      message: nonEmptyText(candidate.message),
      details: nonEmptyText(candidate.details),
      hint: nonEmptyText(candidate.hint),
      code: nonEmptyText(candidate.code),
      status: nonEmptyText(candidate.status ?? candidate.statusCode),
    }
  }

  return {
    name: null,
    message: nonEmptyText(reason),
    details: null,
    hint: null,
    code: null,
    status: null,
  }
}

function includesAny(text: string, markers: readonly string[]): boolean {
  const lowered = text.toLowerCase()
  return markers.some((marker) => lowered.includes(marker))
}

const NETWORK_MARKERS = [
  'failed to fetch',
  'networkerror',
  'network error',
  'network request failed',
  'load failed',
  'fetch failed',
  'connection refused',
  'connection reset',
  'connection timed out',
]

const AUTH_MARKERS = [
  'authentication required',
  'auth session missing',
  'session expired',
  'jwt expired',
  'invalid jwt',
  'token expired',
  'not authenticated',
]

const PERMISSION_MARKERS = [
  'permission denied',
  'insufficient permission',
  'membership required',
  'owner permission required',
  'access required',
  'row-level security',
  'rls rejected',
]

const INTERNAL_MARKERS = [
  'supabase is not configured',
  'postgrest',
  'pgrst',
  'sqlstate',
  'stack trace',
  'schema cache',
  'syntax error at or near',
  'relation "',
  'column "',
  'function public.',
  'table public.',
  'permission denied for table',
  'violates row-level security',
  'violates foreign key constraint',
  'violates unique constraint',
  'null value in column',
]

function safeDisplayMessage(context: ErrorDiagnosticContext, fallback: string): string {
  const message = context.message
  const combined = [context.message, context.details, context.hint, context.code, context.status]
    .filter((value): value is string => Boolean(value))
    .join(' ')

  if (includesAny(combined, NETWORK_MARKERS)) {
    return 'Could not reach BulkText. Check your internet connection and try again.'
  }

  if (context.status === '401' || includesAny(combined, AUTH_MARKERS)) {
    return 'Authentication required. Sign in again and retry.'
  }

  if (context.status === '403' || context.code === '42501' || includesAny(combined, PERMISSION_MARKERS)) {
    return 'You do not have permission to perform this action.'
  }

  if (!message || includesAny(combined, INTERNAL_MARKERS)) return fallback
  return message
}

export function errorMessage(reason: unknown, fallback: string): string {
  const safeFallback = nonEmptyText(fallback) ?? 'Something went wrong. Please try again.'
  return safeDisplayMessage(errorDiagnosticContext(reason), safeFallback)
}
