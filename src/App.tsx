import { Component, Suspense, lazy, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './auth/RequireAuth'
import { ErrorState, LoadingState } from './components/StateViews'
import { reportDiagnostic } from './lib/observability'
import { LandingPage } from './pages/LandingPage'
import { useAuth } from './auth/AuthProvider'
import { RequireWorkspace } from './workspace/RequireWorkspace'

const AppShell = lazy(() => import('./components/AppShell').then((module) => ({ default: module.AppShell })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const CampaignsPage = lazy(() => import('./pages/CampaignsPage').then((module) => ({ default: module.CampaignsPage })))
const CampaignConfirmationPage = lazy(() => import('./pages/CampaignConfirmationPage').then((module) => ({ default: module.CampaignConfirmationPage })))
const CampaignDetailPage = lazy(() => import('./pages/CampaignDetailPage').then((module) => ({ default: module.CampaignDetailPage })))
const SimpleCampaignPage = lazy(() => import('./pages/SimpleCampaignPage').then((module) => ({ default: module.SimpleCampaignPage })))
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage').then((module) => ({ default: module.PlaceholderPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })))
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((module) => ({ default: module.SettingsPage })))
const DevicesPage = lazy(() => import('./pages/DevicesPage').then((module) => ({ default: module.DevicesPage })))
const PhoneNumbersPage = lazy(() => import('./pages/PhoneNumbersPage').then((module) => ({ default: module.PhoneNumbersPage })))
const ImportsPage = lazy(() => import('./pages/ImportsPage').then((module) => ({ default: module.ImportsPage })))
const RecipientValidationPage = lazy(() => import('./pages/RecipientValidationPage').then((module) => ({ default: module.RecipientValidationPage })))
const ConsentSuppressionPage = lazy(() => import('./pages/ConsentSuppressionPage').then((module) => ({ default: module.ConsentSuppressionPage })))
const RecipientEligibilityPage = lazy(() => import('./pages/RecipientEligibilityPage').then((module) => ({ default: module.RecipientEligibilityPage })))
const MessageComposerPage = lazy(() => import('./pages/MessageComposerPage').then((module) => ({ default: module.MessageComposerPage })))
const LoginPage = lazy(() => import('./auth/LoginPage').then((module) => ({ default: module.LoginPage })))
const SignupPage = lazy(() => import('./auth/SignupPage').then((module) => ({ default: module.SignupPage })))
const ForgotPasswordPage = lazy(() => import('./auth/ForgotPasswordPage').then((module) => ({ default: module.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('./auth/ResetPasswordPage').then((module) => ({ default: module.ResetPasswordPage })))
const VerifyEmailPage = lazy(() => import('./auth/VerifyEmailPage').then((module) => ({ default: module.VerifyEmailPage })))
const AuthCallbackPage = lazy(() => import('./auth/AuthCallbackPage').then((module) => ({ default: module.AuthCallbackPage })))

type RouteLoadBoundaryProps = { children: ReactNode }
type RouteLoadBoundaryState = { failed: boolean }

class RouteLoadBoundary extends Component<RouteLoadBoundaryProps, RouteLoadBoundaryState> {
  state: RouteLoadBoundaryState = { failed: false }

  static getDerivedStateFromError(): RouteLoadBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: Error) {
    reportDiagnostic(error, { source: 'route-load', severity: 'error' })
  }

  render() {
    if (this.state.failed) {
      return (
        <ErrorState
          title="This screen could not be loaded"
          action={<button type="button" className="secondary-button" onClick={() => window.location.reload()}>Retry</button>}
        >
          Refresh BulkText and try again. Your saved data has not been changed.
        </ErrorState>
      )
    }
    return this.props.children
  }
}

function LazyScreen({ children, label = 'Loading BulkText screen…' }: { children: ReactNode; label?: string }) {
  return (
    <RouteLoadBoundary>
      <Suspense fallback={<LoadingState label={label} />}>
        {children}
      </Suspense>
    </RouteLoadBoundary>
  )
}

function PublicHomeRoute() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingState label="Loading BulkText…" />
  return user ? <Navigate to="/dashboard" replace /> : <LandingPage />
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth/login" element={<LazyScreen label="Loading sign in…"><LoginPage /></LazyScreen>} />
      <Route path="/auth/signup" element={<LazyScreen label="Loading sign up…"><SignupPage /></LazyScreen>} />
      <Route path="/auth/forgot-password" element={<LazyScreen><ForgotPasswordPage /></LazyScreen>} />
      <Route path="/auth/reset-password" element={<LazyScreen><ResetPasswordPage /></LazyScreen>} />
      <Route path="/auth/verify" element={<LazyScreen><VerifyEmailPage /></LazyScreen>} />
      <Route path="/auth/callback" element={<LazyScreen><AuthCallbackPage /></LazyScreen>} />

      <Route element={<RequireAuth />}>
        <Route element={<RequireWorkspace />}>
          <Route element={<LazyScreen label="Loading workspace…"><AppShell /></LazyScreen>}>
            <Route path="/dashboard" element={<LazyScreen><DashboardPage /></LazyScreen>} />
            <Route path="/campaigns" element={<LazyScreen><CampaignsPage /></LazyScreen>} />
            <Route path="/campaigns/new" element={<LazyScreen><SimpleCampaignPage /></LazyScreen>} />
            <Route path="/campaigns/review/:draftId" element={<LazyScreen><CampaignConfirmationPage /></LazyScreen>} />
            <Route path="/campaigns/:campaignId" element={<LazyScreen><CampaignDetailPage /></LazyScreen>} />
            <Route path="/composer" element={<LazyScreen><MessageComposerPage /></LazyScreen>} />
            <Route path="/contacts" element={<LazyScreen><PhoneNumbersPage /></LazyScreen>} />
            <Route path="/imports" element={<LazyScreen><ImportsPage /></LazyScreen>} />
            <Route path="/imports/:importId/validate" element={<LazyScreen><RecipientValidationPage /></LazyScreen>} />
            <Route path="/recipient-previews/:previewId/eligibility" element={<LazyScreen><RecipientEligibilityPage /></LazyScreen>} />
            <Route path="/consent-suppression" element={<LazyScreen><ConsentSuppressionPage /></LazyScreen>} />
            <Route path="/devices" element={<LazyScreen><DevicesPage /></LazyScreen>} />
            <Route path="/templates" element={<LazyScreen><PlaceholderPage title="Templates" description="Reusable templates are planned after the core send workflow is complete." /></LazyScreen>} />
            <Route path="/reports" element={<LazyScreen><PlaceholderPage title="Reports" description="Recipient-level reports follow cloud-to-phone execution and status synchronization." /></LazyScreen>} />
            <Route path="/subscription" element={<LazyScreen><PlaceholderPage title="Subscription" description="BulkText subscriptions will manage access to the platform while SMS charges remain with your mobile operator." /></LazyScreen>} />
            <Route path="/settings" element={<LazyScreen><SettingsPage /></LazyScreen>} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<PublicHomeRoute />} />
      <Route path="*" element={<LazyScreen><NotFoundPage /></LazyScreen>} />
    </Routes>
  )
}
