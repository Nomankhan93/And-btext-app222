// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Outlet } from 'react-router-dom'
import App from '../App'

const auth = vi.hoisted(() => ({
  value: {
    session: { user: { id: 'user-0196' } } as unknown,
    user: { id: 'user-0196' } as { id: string } | null,
    loading: false,
    signIn: vi.fn(async () => {}),
    signUp: vi.fn(async () => ({ emailConfirmationRequired: false })),
    signOut: vi.fn(async () => {}),
    sendPasswordReset: vi.fn(async () => {}),
    updatePassword: vi.fn(async () => {}),
  },
}))

vi.mock('../auth/AuthProvider', () => ({ useAuth: () => auth.value }))
vi.mock('../auth/RequireAuth', () => ({ RequireAuth: () => <Outlet /> }))
vi.mock('../workspace/RequireWorkspace', () => ({ RequireWorkspace: () => <Outlet /> }))
vi.mock('../components/AppShell', () => ({ AppShell: () => <main><span>Lazy shell loaded</span><Outlet /></main> }))
vi.mock('../pages/CampaignsPage', () => ({ CampaignsPage: () => <h1>Lazy campaigns loaded</h1> }))
vi.mock('../auth/LoginPage', () => ({ LoginPage: () => <h1>Lazy login loaded</h1> }))
vi.mock('../pages/SettingsPage', async () => { throw new Error('simulated lazy chunk failure') })

function renderRoute(entry: string) {
  return render(<MemoryRouter initialEntries={[entry]}><App /></MemoryRouter>)
}

beforeEach(() => {
  auth.value.user = { id: 'user-0196' }
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

it('loads a protected deep route through the lazy authenticated shell', async () => {
  renderRoute('/campaigns')
  expect(await screen.findByText('Lazy shell loaded')).toBeTruthy()
  expect(await screen.findByRole('heading', { name: 'Lazy campaigns loaded' })).toBeTruthy()
})

it('loads a direct auth route lazily without requiring the protected shell', async () => {
  auth.value.user = null
  renderRoute('/auth/login')
  expect(await screen.findByRole('heading', { name: 'Lazy login loaded' })).toBeTruthy()
  expect(screen.queryByText('Lazy shell loaded')).toBeNull()
})

it('shows a recoverable fallback when a lazy route chunk fails', async () => {
  renderRoute('/settings')
  expect(await screen.findByRole('heading', { name: 'This screen could not be loaded' })).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy()
})
