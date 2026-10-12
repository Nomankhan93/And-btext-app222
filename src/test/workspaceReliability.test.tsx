// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { WorkspaceProvider, useWorkspace } from '../workspace/WorkspaceProvider'
import { RequireWorkspace } from '../workspace/RequireWorkspace'
const mocks = vi.hoisted(() => ({ user: { id: 'one' }, rpc: vi.fn() }))
vi.mock('../auth/AuthProvider', () => ({ useAuth: () => ({ user: mocks.user }) }))
vi.mock('../lib/supabase', () => ({ supabase: { rpc: mocks.rpc } }))
function Form() {
  const [value, setValue] = useState('')
  const { workspace, refresh } = useWorkspace()
  return <><span>{workspace?.name}</span><input aria-label="Draft" value={value} onChange={(e) => setValue(e.target.value)} /><button onClick={() => void refresh()}>Refresh workspace</button></>
}
function App() { return <WorkspaceProvider><MemoryRouter><Routes><Route element={<RequireWorkspace />}><Route path="/" element={<Form />} /></Route></Routes></MemoryRouter></WorkspaceProvider> }
function result(id: string) { return { data: [{ workspace_id: id, name: `Workspace ${id}`, slug: id }], error: null } }
beforeEach(() => { localStorage.clear(); mocks.user = { id: 'one' }; mocks.rpc.mockReset().mockResolvedValue(result('one')) })
afterEach(() => { cleanup(); localStorage.clear() })
it('preserves the mounted form across same-user auth object refresh and explicit refresh failure', async () => {
  const view = render(<App />)
  fireEvent.change(await screen.findByLabelText('Draft'), { target: { value: 'Unsaved campaign' } })
  mocks.user = { id: 'one' }
  view.rerender(<App />)
  expect(mocks.rpc).toHaveBeenCalledTimes(1)
  expect((screen.getByLabelText('Draft') as HTMLInputElement).value).toBe('Unsaved campaign')
  let reject!: (value: Error) => void
  mocks.rpc.mockImplementationOnce(() => new Promise((_, fail) => { reject = fail }))
  fireEvent.click(screen.getByText('Refresh workspace'))
  expect((screen.getByLabelText('Draft') as HTMLInputElement).value).toBe('Unsaved campaign')
  await act(async () => { reject(new Error('offline')) })
  expect(screen.getByRole('status').textContent).toContain('preserved')
  expect((screen.getByLabelText('Draft') as HTMLInputElement).value).toBe('Unsaved campaign')
})
it('hides the old account immediately and ignores its late refresh response', async () => {
  const view = render(<App />)
  fireEvent.change(await screen.findByLabelText('Draft'), { target: { value: 'private' } })
  let resolve!: (value: ReturnType<typeof result>) => void
  mocks.rpc.mockImplementationOnce(() => new Promise((done) => { resolve = done }))
  fireEvent.click(screen.getByText('Refresh workspace'))
  mocks.user = { id: 'two' }; mocks.rpc.mockResolvedValue(result('two'))
  view.rerender(<App />)
  expect(screen.queryByDisplayValue('private')).toBeNull()
  await screen.findByText('Workspace two')
  await act(async () => { resolve(result('one')) })
  await waitFor(() => expect(screen.queryByText('Workspace one')).toBeNull())
  expect((screen.getByLabelText('Draft') as HTMLInputElement).value).toBe('')
})
