import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingState } from '../components/StateViews'
import { useAuth } from './AuthProvider'
import { protectedReturnTo } from './returnTo'

export function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingState label="Checking your session…" />
  if (!user) {
    const returnTo = protectedReturnTo(location)
    return <Navigate to={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`} replace />
  }

  return <Outlet />
}
