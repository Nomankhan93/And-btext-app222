import { Outlet } from 'react-router-dom'
import { ErrorState, LoadingState } from '../components/StateViews'
import { useWorkspace } from './WorkspaceProvider'

export function RequireWorkspace() {
  const { workspace, loading, error, refresh } = useWorkspace()

  if (loading && !workspace) return <LoadingState label="Preparing your BulkText account…" />
  if (!workspace) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <ErrorState title="Account setup needs attention">{error ?? 'Your personal workspace is unavailable.'}</ErrorState>
          <button className="primary-button" type="button" onClick={() => void refresh()}>Retry account setup</button>
        </section>
      </main>
    )
  }
  return <div key={workspace.id}>{error ? <div role="status" className="notice warning-notice">Account refresh failed. Your open form is preserved. <button type="button" disabled={loading} onClick={() => void refresh()}>Retry</button></div> : null}<Outlet /></div>
}
