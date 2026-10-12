import { Link, Outlet, useLocation } from 'react-router-dom'
import { ErrorState, LoadingState } from '../components/StateViews'
import { useWorkspace } from './WorkspaceProvider'
import { usePwa } from '../pwa/PwaProvider'

export function RequireWorkspace() {
  const { workspace, authority, loading, error, refresh } = useWorkspace()
  const { online } = usePwa()
  const location = useLocation()
  const localDraftRoute = location.pathname === '/campaigns/new'

  if (loading && !workspace) return <LoadingState label="Preparing your BulkText account…" />

  if (!workspace) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <ErrorState title={online ? 'Account setup needs attention' : 'You’re offline'}>{online ? (error ?? 'Your personal workspace is unavailable.') : 'Reconnect once to verify your BulkText workspace before this browser can reopen account-scoped drafts offline.'}</ErrorState>
          <button className="primary-button" type="button" disabled={!online || loading} onClick={() => void refresh()}>{online ? 'Retry account setup' : 'Reconnect to continue'}</button>
        </section>
      </main>
    )
  }

  if (authority === 'local' && !localDraftRoute) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <ErrorState title={online ? 'Workspace verification required' : 'Offline local-draft access only'}>
            {online
              ? (error ?? 'BulkText has a locally remembered workspace locator, but server authorization has not been verified for this session.')
              : 'This browser remembers the account/workspace locator only so you can reopen your local campaign draft. Dashboard, recipients, devices, review and sending still require server verification.'}
          </ErrorState>
          <div className="button-row">
            <Link className="secondary-button" to="/campaigns/new">Open local campaign draft</Link>
            <button className="primary-button" type="button" disabled={!online || loading} onClick={() => void refresh()}>{online ? 'Verify workspace' : 'Reconnect to verify'}</button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <div key={workspace.id}>
      {authority === 'server' && error ? <div role="status" className="notice warning-notice">Account refresh failed. Your open form is preserved. <button type="button" disabled={!online || loading} onClick={() => void refresh()}>Retry</button></div> : null}
      <Outlet />
    </div>
  )
}
