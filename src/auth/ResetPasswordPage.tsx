import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from './AuthLayout'
import { useAuth } from './AuthProvider'
import { errorMessage } from '../lib/errors'

export function ResetPasswordPage() {
  const { updatePassword, user } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await updatePassword(password)
      navigate('/dashboard', { replace: true })
    } catch (reason) {
      setError(errorMessage(reason, 'Password could not be updated.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout title="Choose a new password" subtitle="Choose a new password after opening the secure recovery link from your email.">
      {!user ? <div className="notice warning-notice" role="status">Waiting for a valid recovery session. Re-open the link from your reset email if needed.</div> : (
        <form className="form-stack" onSubmit={submit} aria-busy={busy}>
          <label>New password<input type="password" autoComplete="new-password" minLength={8} required aria-describedby="reset-password-help" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          <p id="reset-password-help" className="field-help">Use at least 8 characters for your new password.</p>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button className="primary-button" type="submit" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button>
        </form>
      )}
    </AuthLayout>
  )
}
