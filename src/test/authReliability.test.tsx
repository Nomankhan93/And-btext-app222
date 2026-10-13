// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../auth/AuthProvider'
import { campaignDraftKey } from '../lib/campaignDraftStorage'
import { writeOfflineWorkspaceLocator } from '../lib/offlineWorkspaceLocator'

const mock = vi.hoisted(() => ({ getSession: vi.fn(), getUser: vi.fn(), onAuthStateChange: vi.fn() }))
vi.mock('../lib/supabase', () => ({ supabase: { auth: mock } }))

function Probe() {
  const { user, loading, revalidating } = useAuth()
  return <div>{loading ? 'Loading' : user?.id ?? 'Signed out'}{revalidating ? ' validating' : ''}</div>
}

beforeEach(() => {
  mock.getSession.mockReset()
  mock.getUser.mockReset()
  mock.onAuthStateChange.mockReset().mockImplementation(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
  sessionStorage.clear()
  localStorage.clear()
})

afterEach(() => { cleanup(); sessionStorage.clear(); localStorage.clear() })

it('does not resurrect an old login after a newer sign-out event', async () => {
  let resolve!: (value: unknown) => void
  let callback!: (event: string, session: unknown) => void
  mock.getSession.mockImplementation(() => new Promise((done) => { resolve = done }))
  mock.onAuthStateChange.mockImplementation((handler) => { callback = handler; return { data: { subscription: { unsubscribe: vi.fn() } } } })
  sessionStorage.setItem(campaignDraftKey('one', 'workspace'), '{}')
  render(<AuthProvider><Probe /></AuthProvider>)
  act(() => callback('SIGNED_OUT', null))
  await act(async () => { resolve({ data: { session: { user: { id: 'old' } } } }) })
  expect(screen.getByText('Signed out')).toBeTruthy()
  expect(sessionStorage.getItem(campaignDraftKey('one', 'workspace'))).toBeNull()
})

it('revalidates on focus, expires an invalid session and clears prior account-scoped state', async () => {
  mock.getSession.mockResolvedValue({ data: { session: { user: { id: 'one' } } } })
  mock.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'JWT expired', status: 401 } })
  writeOfflineWorkspaceLocator('one', { workspaceId: 'workspace-one', name: 'One', slug: 'one' })
  sessionStorage.setItem(campaignDraftKey('one', 'workspace-one'), '{}')
  sessionStorage.setItem('bulktext:diagnostics:v1', JSON.stringify([{ id: 'old-diagnostic' }]))

  render(<AuthProvider><Probe /></AuthProvider>)
  expect(await screen.findByText('one')).toBeTruthy()

  act(() => window.dispatchEvent(new Event('focus')))
  await screen.findByText('Signed out')

  expect(mock.getUser).toHaveBeenCalledTimes(1)
  expect(localStorage.length).toBe(0)
  expect(sessionStorage.getItem(campaignDraftKey('one', 'workspace-one'))).toBeNull()
  const diagnostics = JSON.parse(sessionStorage.getItem('bulktext:diagnostics:v1') ?? '[]') as Array<{ category?: string }>
  expect(diagnostics).toHaveLength(1)
  expect(diagnostics[0]?.category).toBe('authentication')
})

it('preserves a valid mounted session when background revalidation only hits the network', async () => {
  mock.getSession.mockResolvedValue({ data: { session: { user: { id: 'one' } } } })
  mock.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'Failed to fetch' } })

  render(<AuthProvider><Probe /></AuthProvider>)
  expect(await screen.findByText('one')).toBeTruthy()

  act(() => window.dispatchEvent(new Event('focus')))
  await waitFor(() => expect(mock.getUser).toHaveBeenCalledTimes(1))
  expect(screen.getByText('one')).toBeTruthy()
})
