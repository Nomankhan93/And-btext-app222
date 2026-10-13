// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../auth/AuthProvider'
import { campaignDraftKey } from '../lib/campaignDraftStorage'
import { writeOfflineWorkspaceLocator } from '../lib/offlineWorkspaceLocator'

const mock = vi.hoisted(() => ({
  currentUser: { uid: 'one', email: 'one@example.com', getIdToken: vi.fn(async () => 'token'), reload: vi.fn() } as any,
  onAuthStateChange: vi.fn(),
}))
vi.mock('../firebase', () => ({ auth: { get currentUser() { return mock.currentUser } }, firebaseConfigured: true }))
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth, callback) => {
    mock.onAuthStateChange.mockImplementation(callback)
    callback(mock.currentUser)
    return vi.fn()
  }),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  updatePassword: vi.fn(),
  updateProfile: vi.fn(),
}))

function Probe() {
  const { user, loading, revalidating } = useAuth()
  return <div>{loading ? 'Loading' : user?.id ?? 'Signed out'}{revalidating ? ' validating' : ''}</div>
}

beforeEach(() => {
  mock.onAuthStateChange.mockReset()
  mock.currentUser = { uid: 'one', email: 'one@example.com', getIdToken: vi.fn(async () => 'token'), reload: vi.fn().mockResolvedValue(undefined) }
  sessionStorage.clear()
  localStorage.clear()
})

afterEach(() => { cleanup(); sessionStorage.clear(); localStorage.clear() })

it('does not resurrect an old login after a newer sign-out event', async () => {
  sessionStorage.setItem(campaignDraftKey('one', 'workspace'), '{}')
  render(<AuthProvider><Probe /></AuthProvider>)
  await act(async () => {
    mock.currentUser = null
    mock.onAuthStateChange(null)
  })
  expect(await screen.findByText('Signed out')).toBeTruthy()
  expect(sessionStorage.getItem(campaignDraftKey('one', 'workspace'))).toBeNull()
})

it('revalidates on focus, expires an invalid session and clears prior account-scoped state', async () => {
  const reloadFn = mock.currentUser.reload
  mock.currentUser.reload.mockImplementation(async () => {
    mock.currentUser = null
    throw { message: 'JWT expired', code: 'auth/id-token-expired' }
  })
  writeOfflineWorkspaceLocator('one', { workspaceId: 'workspace-one', name: 'One', slug: 'one' })
  sessionStorage.setItem(campaignDraftKey('one', 'workspace-one'), '{}')
  sessionStorage.setItem('bulktext:diagnostics:v1', JSON.stringify([{ id: 'old-diagnostic' }]))

  render(<AuthProvider><Probe /></AuthProvider>)
  expect(await screen.findByText('one')).toBeTruthy()

  act(() => window.dispatchEvent(new Event('focus')))
  await screen.findByText('Signed out')

  expect(reloadFn).toHaveBeenCalledTimes(1)
  expect(localStorage.length).toBe(0)
  expect(sessionStorage.getItem(campaignDraftKey('one', 'workspace-one'))).toBeNull()
  const diagnostics = JSON.parse(sessionStorage.getItem('bulktext:diagnostics:v1') ?? '[]') as Array<{ category?: string }>
  expect(diagnostics).toHaveLength(1)
  expect(diagnostics[0]?.category).toBe('authentication')
})

it('preserves a valid mounted session when background revalidation only hits the network', async () => {
  mock.currentUser.reload.mockRejectedValue(new Error('Failed to fetch'))

  render(<AuthProvider><Probe /></AuthProvider>)
  expect(await screen.findByText('one')).toBeTruthy()

  act(() => window.dispatchEvent(new Event('focus')))
  await waitFor(() => expect(mock.currentUser.reload).toHaveBeenCalledTimes(1))
  expect(screen.getByText('one')).toBeTruthy()
})
