import { Outlet } from 'react-router-dom'
import { ErrorState, LoadingState } from '../components/StateViews'
import { useWorkspace } from './WorkspaceProvider'
import { usePwa } from '../pwa/PwaProvider'

export function RequireWorkspace() {
  const { workspace, loading, error, refresh } = useWorkspace()
  const { online } = usePwa()

  if (loading && !workspace) return <LoadingState label="Preparing your BulkText account…" />
  if (!workspace) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <ErrorState title={online ? 'Account setup needs attention' : 'You’re offline'}>{online ? (error ?? 'Your personal workspace is unavailable.') : 'Reconnect to load your BulkText workspace. Server account data is not cached for offline use.'}</ErrorState>
          <button className="primary-button" type="button" disabled={!online || loading} onClick={() => void refresh()}>{online ? 'Retry account setup' : 'Reconnect to continue'}</button>
        </section>
      </main>
    )
  }
  return <div key={workspace.id}>{error ? <div role="status" className="notice warning-notice">Account refresh failed. Your open form is preserved. <button type="button" disabled={!online || loading} onClick={() => void refresh()}>Retry</button></div> : null}<Outlet /></div>
}
