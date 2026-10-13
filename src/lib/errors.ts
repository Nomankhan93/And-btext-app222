import { reportDiagnostic, type DiagnosticCategory } from './observability'

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
  'unavailable',
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
  'functions/internal',
  'functions/not-found',
  'functions/unavailable',
  'functions/unknown',
  'functions/cancelled',
  'functions/deadline-exceeded',
  'internal',
  'unauthenticated',
]

export function errorDiagnosticCategory(context: ErrorDiagnosticContext): DiagnosticCategory | 'domain' {
  const combined = [context.message, context.details, context.hint, context.code, context.status]
    .filter((value): value is string => Boolean(value))
    .join(' ')

  const loweredMsg = context.message?.toLowerCase() ?? ''
  if (loweredMsg === 'offline' || includesAny(combined, NETWORK_MARKERS)) return 'network'
  if (context.status === '401' || includesAny(combined, AUTH_MARKERS)) return 'authentication'
  if (context.status === '403' || context.code === '42501' || includesAny(combined, PERMISSION_MARKERS)) return 'permission'
  const statusNumber = Number(context.status)
  if ((Number.isFinite(statusNumber) && statusNumber >= 500) || includesAny(combined, INTERNAL_MARKERS)) return 'internal'
  return context.message ? 'domain' : 'unknown'
}

function formatFirebaseErrorMessage(context: ErrorDiagnosticContext): string | null {
  const code = context.code || (context.message ? (context.message.match(/auth\/[a-z0-9-]+/i)?.[0] ?? null) : null)
  if (!code) return null

  switch (code.toLowerCase()) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-password':
      return 'Invalid email or password. Please try again.'
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists.'
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 8 characters.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.'
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Please wait a few minutes and try again.'
    case 'auth/expired-action-code':
      return 'This password reset link has expired. Please request a new one.'
    case 'auth/invalid-action-code':
      return 'This password reset link is invalid or has already been used.'
    case 'auth/requires-recent-login':
      return 'For security reasons, please sign in again before changing your password.'
    case 'auth/network-request-failed':
      return 'Could not reach BulkText. Check your internet connection and try again.'
    default:
      if (code.startsWith('auth/')) {
        return 'An authentication error occurred. Please try again.'
      }
      return null
  }
}

function safeDisplayMessage(context: ErrorDiagnosticContext, fallback: string, category: DiagnosticCategory | 'domain'): string {
  const firebaseFriendly = formatFirebaseErrorMessage(context)
  if (firebaseFriendly) return firebaseFriendly

  if (category === 'network') return 'Could not reach BulkText. Check your internet connection and try again.'
  if (category === 'authentication') return 'Authentication required. Sign in again and retry.'
  if (category === 'permission') return 'You do not have permission to perform this action.'
  const lowerMessage = context.message?.toLowerCase() ?? ''
  if (category === 'internal' || category === 'unknown' || lowerMessage === 'internal' || lowerMessage.includes('functions/')) return fallback
  return context.message ?? fallback
}

export function errorMessage(reason: unknown, fallback: string): string {
  const safeFallback = nonEmptyText(fallback) ?? 'Something went wrong. Please try again.'
  const context = errorDiagnosticContext(reason)
  const category = errorDiagnosticCategory(context)
  if (category !== 'domain') {
    reportDiagnostic(context, { source: 'handled-error', category, severity: 'error' })
  }
  return safeDisplayMessage(context, safeFallback, category)
}
