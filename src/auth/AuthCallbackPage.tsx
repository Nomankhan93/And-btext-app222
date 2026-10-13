import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LoadingState } from '../components/StateViews'
import { supabase } from '../lib/supabase'
import { AuthLayout } from './AuthLayout'
import { safeReturnTo } from './returnTo'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnTo = safeReturnTo(searchParams.get('returnTo'))

  useEffect(() => {
    if (!supabase) {
      navigate('/auth/login', { replace: true })
      return
    }
    void supabase.auth.getSession().then(({ data }) => {
      navigate(data.session ? returnTo : `/auth/login?returnTo=${encodeURIComponent(returnTo)}`, { replace: true })
    })
  }, [navigate, returnTo])

  return (
    <AuthLayout title="Completing authentication" subtitle="BulkText is finishing your secure account session.">
      <LoadingState label="Completing authentication…" />
    </AuthLayout>
  )
}
