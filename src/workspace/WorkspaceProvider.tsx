import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { errorMessage } from '../lib/errors'
import { readOfflineWorkspaceLocator, writeOfflineWorkspaceLocator } from '../lib/offlineWorkspaceLocator'
import { supabase } from '../lib/supabase'

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

export function WorkspaceProvider({ children }: PropsWithChildren) {
  const { user } = useAuth()
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
    if (!supabase) {
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
      const { data, error: rpcError } = await supabase.rpc('get_my_personal_workspace')
      if (rpcError) throw rpcError
      const row = (data as PersonalWorkspaceRow[] | null)?.[0]
      if (!row?.workspace_id) throw new Error('Your personal workspace could not be provisioned.')
      const workspace = { id: row.workspace_id, name: row.name, slug: row.slug }
      writeOfflineWorkspaceLocator(userId, { workspaceId: workspace.id, name: workspace.name, slug: workspace.slug })
      if (request === generation.current) setState({ owner: userId, workspace, authority: 'server', loading: false, error: null })
    } catch (reason) {
      if (request === generation.current) {
        setState((current) => ({
          owner: userId,
          workspace: current.owner === userId && current.workspace ? current.workspace : cached,
          authority: current.owner === userId && current.workspace ? current.authority : (cached ? 'local' : null),
          loading: false,
          error: errorMessage(reason, 'Your BulkText account could not be prepared.'),
        }))
      }
    }
  }, [userId])

  useEffect(() => {
    void refresh()
    return () => { generation.current += 1 }
  }, [refresh])

  // Hide the previous account immediately, before the identity-change effect runs.
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
