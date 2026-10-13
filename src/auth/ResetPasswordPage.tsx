import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { confirmPasswordReset } from 'firebase/auth'
import { AuthLayout } from './AuthLayout'
import { useAuth } from './AuthProvider'
import { errorMessage } from '../lib/errors'
import { auth } from '../firebase'

export function ResetPasswordPage() {
  const { updatePassword, user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const oobCode = searchParams.get('oobCode')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (oobCode) {
        if (!auth) throw new Error('Firebase Auth is not configured.')
        await confirmPasswordReset(auth, oobCode, password)
        setSuccess(true)
      } else if (user) {
        await updatePassword(password)
        navigate('/dashboard', { replace: true })
      } else {
        throw new Error('No valid recovery token or active user session.')
      }
    } catch (reason) {
      setError(errorMessage(reason, 'Password could not be updated.'))
    } finally {
      setBusy(false)
    }
  }

  const isEligible = Boolean(oobCode || user)

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Choose a new password after opening the secure recovery link from your email."
      footer={success ? <Link to="/auth/login">Proceed to sign in</Link> : undefined}
    >
      {success ? (
        <div className="notice success-notice" role="status">Your password has been successfully reset. You can now sign in with your new password.</div>
      ) : !isEligible ? (
        <div className="notice warning-notice" role="status">Waiting for a valid recovery session. Re-open the link from your reset email if needed.</div>
      ) : (
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
