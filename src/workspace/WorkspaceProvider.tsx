import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { errorMessage } from '../lib/errors'
import { supabase } from '../lib/supabase'

export interface PersonalWorkspace {
  id: string
  name: string
  slug: string
}

interface WorkspaceContextValue {
  workspace: PersonalWorkspace | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

interface PersonalWorkspaceRow {
  workspace_id: string
  name: string
  slug: string
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({ children }: PropsWithChildren) {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const [state, setState] = useState<{ owner: string | null; workspace: PersonalWorkspace | null; loading: boolean; error: string | null }>({ owner: null, workspace: null, loading: false, error: null })
  const generation = useRef(0)

  const refresh = useCallback(async () => {
    const request = ++generation.current
    if (!userId || !supabase) {
      setState({ owner: userId, workspace: null, loading: false, error: null })
      return
    }
    setState((current) => ({ owner: userId, workspace: current.owner === userId ? current.workspace : null, loading: true, error: null }))
    try {
      const { data, error: rpcError } = await supabase.rpc('get_my_personal_workspace')
      if (rpcError) throw rpcError
      const row = (data as PersonalWorkspaceRow[] | null)?.[0]
      if (!row?.workspace_id) throw new Error('Your personal workspace could not be provisioned.')
      if (request === generation.current) setState({ owner: userId, workspace: { id: row.workspace_id, name: row.name, slug: row.slug }, loading: false, error: null })
    } catch (reason) {
      if (request === generation.current) setState((current) => ({ ...current, loading: false, error: errorMessage(reason, 'Your BulkText account could not be prepared.') }))
    }
  }, [userId])

  useEffect(() => {
    void refresh()
    return () => { generation.current += 1 }
  }, [refresh])

  // Hide the previous account immediately, before the identity-change effect runs.
  const owned = state.owner === userId
  const workspace = owned ? state.workspace : null
  const loading = Boolean(userId) && (!owned || state.loading)
  const error = owned ? state.error : null
  const value = useMemo<WorkspaceContextValue>(() => ({ workspace, loading, error, refresh }), [workspace, loading, error, refresh])
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace(): WorkspaceContextValue {
  const value = useContext(WorkspaceContext)
  if (!value) throw new Error('useWorkspace must be used inside WorkspaceProvider')
  return value
}
