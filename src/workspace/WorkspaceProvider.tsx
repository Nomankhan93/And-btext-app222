import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useAuth } from '../auth/AuthProvider'
import { errorDiagnosticCategory, errorDiagnosticContext, errorMessage } from '../lib/errors'
import { clearOfflineWorkspaceLocator, readOfflineWorkspaceLocator, writeOfflineWorkspaceLocator } from '../lib/offlineWorkspaceLocator'
import * as firebaseModule from '../firebase'
import { httpsCallable } from 'firebase/functions'

export interface PersonalWorkspace {
  id: string
  name: string
  slug: string
}

export type WorkspaceAuthority = 'server' | 'local' | null

interface WorkspaceContextValue {
  workspace: PersonalWorkspace | null
  authority: WorkspaceAuthority
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

interface PersonalWorkspaceRow {
  workspace_id: string
  name: string
  slug: string
}

interface WorkspaceState {
  owner: string | null
  workspace: PersonalWorkspace | null
  authority: WorkspaceAuthority
  loading: boolean
  error: string | null
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

function cachedWorkspace(userId: string): PersonalWorkspace | null {
  const cached = readOfflineWorkspaceLocator(userId)
  return cached ? { id: cached.workspaceId, name: cached.name, slug: cached.slug } : null
}

async function fetchOrCreateFirestoreWorkspace(userId: string, displayName?: string | null): Promise<PersonalWorkspace> {
  const defaultWs: PersonalWorkspace = {
    id: userId,
    name: `${displayName?.trim() ? displayName.trim() : 'Personal'} Workspace`,
    slug: userId,
  }

  try {
    const firestoreDb = (firebaseModule as any)?.db
    if (!firestoreDb) {
      return defaultWs
    }

    const wsRef = doc(firestoreDb, 'workspaces', userId)
    const snapshot = await getDoc(wsRef)
    if (snapshot.exists()) {
      const data = snapshot.data()
      return {
        id: snapshot.id,
        name: data.name ?? defaultWs.name,
        slug: data.slug ?? defaultWs.slug,
      }
    } else {
      await setDoc(
        wsRef,
        {
          workspace_id: userId,
          name: defaultWs.name,
          slug: defaultWs.slug,
          owner_id: userId,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        },
        { merge: true },
      )
      return defaultWs
    }
  } catch {
    return defaultWs
  }
}

export function WorkspaceProvider({ children }: PropsWithChildren) {
  const { user, revalidateSession } = useAuth()
  const userId = user?.id ?? null
  const [state, setState] = useState<WorkspaceState>({ owner: null, workspace: null, authority: null, loading: false, error: null })
  const generation = useRef(0)

  const refresh = useCallback(async () => {
    const request = ++generation.current
    if (!userId) {
      setState({ owner: null, workspace: null, authority: null, loading: false, error: null })
      return
    }

    const cached = cachedWorkspace(userId)
    const firebaseConfigured = Boolean((firebaseModule as any)?.firebaseConfigured)
    const functions = (firebaseModule as any)?.functions

    if (!firebaseConfigured) {
      setState({ owner: userId, workspace: cached, authority: cached ? 'local' : null, loading: false, error: null })
      return
    }

    setState((current) => {
      const sameOwner = current.owner === userId
      const workspace = sameOwner ? current.workspace : cached
      const authority = sameOwner ? current.authority : (cached ? 'local' : null)
      return { owner: userId, workspace, authority, loading: true, error: null }
    })

    try {
      let workspace: PersonalWorkspace | null = null

      if (functions) {
        try {
          const fn = httpsCallable(functions, 'get_my_personal_workspace')
          const result = await fn()
          const row = (result.data as PersonalWorkspaceRow[] | null)?.[0] ?? (result.data as PersonalWorkspaceRow)
          if (row?.workspace_id) {
            workspace = { id: row.workspace_id, name: row.name, slug: row.slug }
          }
        } catch (fnError) {
          const cat = errorDiagnosticCategory(errorDiagnosticContext(fnError))
          if (cat === 'authentication' || cat === 'permission' || cat === 'network') {
            throw fnError
          }
          // For internal/unknown Cloud Function errors, fall back to Firestore
        }
      }

      if (!workspace) {
        workspace = await fetchOrCreateFirestoreWorkspace(userId, user?.displayName)
      }

      if (request === generation.current && workspace) {
        writeOfflineWorkspaceLocator(userId, { workspaceId: workspace.id, name: workspace.name, slug: workspace.slug })
        setState({ owner: userId, workspace, authority: 'server', loading: false, error: null })
      }
    } catch (reason) {
      if (request !== generation.current) return
      const category = errorDiagnosticCategory(errorDiagnosticContext(reason))
      const message = errorMessage(reason, 'Your BulkText account could not be prepared.')

      if (category === 'authentication' || category === 'permission') {
        clearOfflineWorkspaceLocator(userId)
        setState({ owner: userId, workspace: null, authority: null, loading: false, error: message })
        if (category === 'authentication') void revalidateSession()
        return
      }

      if (category === 'network') {
        setState((current) => {
          const existing = current.owner === userId ? current.workspace : null
          const existingAuth = current.owner === userId ? current.authority : null
          if (existing) {
            return { owner: userId, workspace: existing, authority: existingAuth, loading: false, error: message }
          }
          if (cached) {
            return { owner: userId, workspace: cached, authority: 'local', loading: false, error: message }
          }
          return { owner: userId, workspace: null, authority: null, loading: false, error: message }
        })
        return
      }

      const fallbackWs = await fetchOrCreateFirestoreWorkspace(userId, user?.displayName)
      writeOfflineWorkspaceLocator(userId, { workspaceId: fallbackWs.id, name: fallbackWs.name, slug: fallbackWs.slug })
      setState({ owner: userId, workspace: fallbackWs, authority: 'server', loading: false, error: null })
    }
  }, [revalidateSession, userId, user?.displayName])

  useEffect(() => {
    void refresh()
    return () => { generation.current += 1 }
  }, [refresh])

  useEffect(() => {
    if (!userId) return
    const refreshWhenActive = () => {
      if (navigator.onLine) void refresh()
    }
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) void refresh()
    }
    window.addEventListener('online', refreshWhenActive)
    window.addEventListener('focus', refreshWhenActive)
    document.addEventListener('visibilitychange', refreshWhenVisible)
    return () => {
      window.removeEventListener('online', refreshWhenActive)
      window.removeEventListener('focus', refreshWhenActive)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [refresh, userId])

  const owned = state.owner === userId
  const workspace = owned ? state.workspace : null
  const authority = owned ? state.authority : null
  const loading = Boolean(userId) && (!owned || state.loading)
  const error = owned ? state.error : null
  const value = useMemo<WorkspaceContextValue>(() => ({ workspace, authority, loading, error, refresh }), [workspace, authority, loading, error, refresh])
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace(): WorkspaceContextValue {
  const value = useContext(WorkspaceContext)
  if (!value) throw new Error('useWorkspace must be used inside WorkspaceProvider')
  return value
}
