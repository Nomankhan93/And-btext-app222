// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import { AuthProvider, useAuth } from '../auth/AuthProvider'
import { campaignDraftKey } from '../lib/campaignDraftStorage'
const mock = vi.hoisted(() => ({ getSession: vi.fn(), onAuthStateChange: vi.fn() }))
vi.mock('../lib/supabase', () => ({ supabase: { auth: mock } }))
afterEach(() => { cleanup(); sessionStorage.clear() })
it('does not resurrect an old login after a newer sign-out event', async () => {
  let resolve!: (value: unknown) => void
  let callback!: (event: string, session: unknown) => void
  mock.getSession.mockImplementation(() => new Promise((done) => { resolve = done }))
  mock.onAuthStateChange.mockImplementation((handler) => { callback = handler; return { data: { subscription: { unsubscribe: vi.fn() } } } })
  function Probe() { const { user, loading } = useAuth(); return <div>{loading ? 'Loading' : user?.id ?? 'Signed out'}</div> }
  sessionStorage.setItem(campaignDraftKey('one', 'workspace'), '{}')
  render(<AuthProvider><Probe /></AuthProvider>)
  act(() => callback('SIGNED_OUT', null))
  await act(async () => { resolve({ data: { session: { user: { id: 'old' } } } }) })
  expect(screen.getByText('Signed out')).toBeTruthy()
  expect(sessionStorage.length).toBe(0)
})
