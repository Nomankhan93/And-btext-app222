import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth'
import { clearCampaignDrafts } from '../lib/campaignDraftStorage'
import { errorDiagnosticCategory, errorDiagnosticContext } from '../lib/errors'
import { clearRecentDiagnosticEvents, reportDiagnostic } from '../lib/observability'
import { clearOfflineWorkspaceLocators } from '../lib/offlineWorkspaceLocator'
import { auth, firebaseConfigured } from '../firebase'

export interface AuthUser {
  id: string
  email: string | null
  displayName: string | null
  user_metadata?: {
    display_name?: string | null
  }
}

export interface AuthSession {
  user: AuthUser
  accessToken: string
}

interface SignUpInput {
  email: string
  password: string
  displayName: string
}

interface AuthContextValue {
  session: AuthSession | null
  user: AuthUser | null
  loading: boolean
  revalidating: boolean
  revalidateSession: () => Promise<boolean>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (input: SignUpInput) => Promise<{ emailConfirmationRequired: boolean }>
  signOut: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function requireAuth() {
  if (!auth) throw new Error('Firebase Auth is not configured. Set VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID.')
  return auth
}

async function clearAccountScopedState() {
  await clearCampaignDrafts()
  clearOfflineWorkspaceLocators()
  clearRecentDiagnosticEvents()
}

function toAuthUser(user: any): AuthUser {
  return {
    id: user.uid,
    email: user.email,
    displayName: user.displayName,
    user_metadata: {
      display_name: user.displayName,
    },
  }
}

async function toAuthSession(user: any): Promise<AuthSession> {
  const accessToken = await user.getIdToken()
  return {
    user: toAuthUser(user),
    accessToken,
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const _osc = onAuthStateChanged
  void _osc
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [revalidating, setRevalidating] = useState(false)
  const sessionRef = useRef<AuthSession | null>(null)
  const generation = useRef(0)
  const revalidationInFlight = useRef<Promise<boolean> | null>(null)

  useEffect(() => {
    sessionRef.current = session
  }, [session])

  useEffect(() => {
    if (!firebaseConfigured || !auth) {
      setLoading(false)
      return
    }

    let active = true
    const request = ++generation.current

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!active) return
      const eventGeneration = ++generation.current
      const previousUserId = sessionRef.current?.user.id ?? null
      const nextUserId = firebaseUser?.uid ?? null
      const identityChanged = Boolean(previousUserId && nextUserId && previousUserId !== nextUserId)

      if (identityChanged) {
        sessionRef.current = null
        setSession(null)
        setLoading(true)
        await clearAccountScopedState()
        if (!active || eventGeneration !== generation.current) return
      }

      if (!firebaseUser) {
        await clearAccountScopedState()
        sessionRef.current = null
        setSession(null)
        setLoading(false)
        return
      }

      try {
        const nextSession = await toAuthSession(firebaseUser)
        sessionRef.current = nextSession
        setSession(nextSession)
        setLoading(false)
      } catch (reason) {
        reportDiagnostic(reason, { source: 'handled-error', severity: 'warning' })
        setLoading(false)
      }
    }, (error) => {
      if (active && request === generation.current) {
        reportDiagnostic(error, { source: 'handled-error', severity: 'warning' })
        setLoading(false)
      }
    })

    return () => {
      active = false
      generation.current += 1
      unsubscribe()
    }
  }, [])

  const revalidateSession = useCallback(async (): Promise<boolean> => {
    if (revalidationInFlight.current) return revalidationInFlight.current
    const current = sessionRef.current
    if (!firebaseConfigured || !auth || !current || !auth.currentUser) return Promise.resolve(false)
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return Promise.resolve(true)

    const request = ++generation.current
    setRevalidating(true)
    const task = (async () => {
      try {
        await auth.currentUser.reload()
        const firebaseUser = auth.currentUser
        if (request !== generation.current) return Boolean(sessionRef.current)
        if (!firebaseUser) {
          await clearAccountScopedState()
          sessionRef.current = null
          setSession(null)
          return false
        }
        const nextSession = await toAuthSession(firebaseUser)
        const activeSession = sessionRef.current
        if (activeSession && activeSession.user.id !== nextSession.user.id) {
          await clearAccountScopedState()
          sessionRef.current = null
          setSession(null)
          return false
        }
        sessionRef.current = nextSession
        setSession(nextSession)
        return true
      } catch (reason: any) {
        if (request === generation.current) {
          const category = errorDiagnosticCategory(errorDiagnosticContext(reason))
          if (category === 'authentication' || category === 'permission' || String(reason?.code ?? '').includes('expired') || String(reason?.message ?? '').includes('expired') || String(reason?.code ?? '').includes('auth/')) {
            await clearAccountScopedState()
            reportDiagnostic(reason, { source: 'handled-error', category: 'authentication', severity: 'warning' })
            if (request === generation.current) {
              sessionRef.current = null
              setSession(null)
            }
            return false
          }
          reportDiagnostic(reason, { source: 'handled-error', severity: 'warning' })
        }
        return Boolean(sessionRef.current)
      } finally {
        setRevalidating(false)
      }
    })()

    revalidationInFlight.current = task
    void task.finally(() => {
      if (revalidationInFlight.current === task) revalidationInFlight.current = null
    })
    return task
  }, [])

  useEffect(() => {
    const revalidateWhenActive = () => { void revalidateSession() }
    const revalidateWhenVisible = () => {
      if (document.visibilityState === 'visible') void revalidateSession()
    }
    window.addEventListener('online', revalidateWhenActive)
    window.addEventListener('focus', revalidateWhenActive)
    document.addEventListener('visibilitychange', revalidateWhenVisible)
    return () => {
      window.removeEventListener('online', revalidateWhenActive)
      window.removeEventListener('focus', revalidateWhenActive)
      document.removeEventListener('visibilitychange', revalidateWhenVisible)
    }
  }, [revalidateSession])

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    loading,
    revalidating,
    revalidateSession,
    async signIn(email, password) {
      const clientAuth = requireAuth()
      await signInWithEmailAndPassword(clientAuth, email.trim(), password)
    },
    async signUp({ email, password, displayName }) {
      const clientAuth = requireAuth()
      const credential = await createUserWithEmailAndPassword(clientAuth, email.trim(), password)
      if (displayName && credential.user) {
        await updateProfile(credential.user, { displayName: displayName.trim() })
      }
      return { emailConfirmationRequired: false }
    },
    async signOut() {
      const clientAuth = requireAuth()
      generation.current += 1
      await clearAccountScopedState()
      await firebaseSignOut(clientAuth)
      sessionRef.current = null
      setSession(null)
    },
    async sendPasswordReset(email) {
      const clientAuth = requireAuth()
      await sendPasswordResetEmail(clientAuth, email.trim(), {
        url: `${window.location.origin}/auth/reset-password`,
      })
    },
    async updatePassword(password) {
      const clientAuth = requireAuth()
      const currentUser = clientAuth.currentUser
      if (!currentUser) throw new Error('No signed in user')
      await firebaseUpdatePassword(currentUser, password)
    },
  }), [loading, revalidateSession, revalidating, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
