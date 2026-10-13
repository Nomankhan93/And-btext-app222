import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { ErrorState } from '../components/StateViews'
import { PwaInstallCard } from '../components/PwaStatus'
import { errorMessage } from '../lib/errors'
import { clearRecentDiagnosticEvents, diagnosticSnapshot, getRecentDiagnosticEvents, subscribeDiagnosticEvents } from '../lib/observability'
import { supabase } from '../lib/supabase'
import { usePwa } from '../pwa/PwaProvider'

export function SettingsPage() {
  const { user } = useAuth()
  const { online } = usePwa()
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [diagnosticCount, setDiagnosticCount] = useState(() => getRecentDiagnosticEvents().length)
  const [diagnosticMessage, setDiagnosticMessage] = useState<string | null>(null)

  useEffect(() => subscribeDiagnosticEvents((events) => setDiagnosticCount(events.length)), [])

  useEffect(() => {
    if (!supabase || !user || !online) return
    void supabase.from('profiles').select('display_name').eq('id', user.id).single().then(({ data }) => {
      if (data?.display_name) setDisplayName(data.display_name as string)
    })
  }, [user, online])

  async function saveProfile(event: FormEvent) {
    event.preventDefault()
    if (!supabase || !user || !online) return
    setBusy(true)
    setError(null)
    setMessage(null)
    const { error: updateError } = await supabase.from('profiles').update({ display_name: displayName.trim() || null }).eq('id', user.id)
    if (updateError) setError(errorMessage(updateError, 'Could not update your profile.'))
    else setMessage('Profile updated.')
    setBusy(false)
  }

  async function copyDiagnostics() {
    setDiagnosticMessage(null)
    const text = JSON.stringify(diagnosticSnapshot(), null, 2)
    try {
      await navigator.clipboard.writeText(text)
      setDiagnosticMessage('Sanitized diagnostics copied.')
    } catch {
      setDiagnosticMessage('Could not copy diagnostics. Browser clipboard access is unavailable.')
    }
  }

  function clearDiagnostics() {
    clearRecentDiagnosticEvents()
    setDiagnosticMessage('Recent diagnostics cleared.')
  }

  return (
    <div className="page-stack">
      <section className="page-heading"><div><p className="eyebrow">Account</p><h1>Settings</h1><p>Manage the profile attached to your personal BulkText account.</p></div></section>
      {error ? <ErrorState title="Update failed">{error}</ErrorState> : null}
      {message ? <div className="notice success-notice">{message}</div> : null}

      <PwaInstallCard />

      <section className="panel">
        <div className="panel-heading"><div><p className="eyebrow">Profile</p><h2>Your account profile</h2></div></div>
        <form className="form-stack narrow-form" onSubmit={saveProfile}>
          <label>Email<input value={user?.email ?? ''} disabled aria-readonly="true" /><small>Your sign-in email is managed by your account authentication.</small></label>
          <label>Display name<input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={100} /></label>
          {!online ? <div className="notice warning-notice">Reconnect to save profile changes.</div> : null}
          <button className="primary-button" type="submit" disabled={busy || !online}>{busy ? 'Saving…' : 'Save profile'}</button>
        </form>
      </section>


      <section className="panel">
        <div className="panel-heading"><div><p className="eyebrow">Support</p><h2>Technical diagnostics</h2></div></div>
        <p className="muted-copy">BulkText keeps up to 25 sanitized client error events for this browser tab session. Message contents, phone numbers, contact data, auth tokens, query strings, backend details and hints are not stored.</p>
        <p><strong>Recent events:</strong> {diagnosticCount}</p>
        <div className="button-row">
          <button className="secondary-button" type="button" onClick={() => void copyDiagnostics()} disabled={diagnosticCount === 0}>Copy diagnostics</button>
          <button className="secondary-button" type="button" onClick={clearDiagnostics} disabled={diagnosticCount === 0}>Clear diagnostics</button>
        </div>
        {diagnosticMessage ? <div className="notice" role="status">{diagnosticMessage}</div> : null}
      </section>
    </div>
  )
}
