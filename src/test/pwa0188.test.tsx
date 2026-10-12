// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { PwaInstallCard, PwaStatusRegion } from '../components/PwaStatus'
import { PwaProvider, usePwa } from '../pwa/PwaProvider'

function setOnline(value: boolean) {
  Object.defineProperty(window.navigator, 'onLine', { configurable: true, value })
}

function Probe() {
  const { online, canInstall, installed } = usePwa()
  return <output>{`${online ? 'online' : 'offline'}|${canInstall ? 'installable' : 'not-installable'}|${installed ? 'installed' : 'browser'}`}</output>
}

beforeEach(() => {
  setOnline(true)
})

afterEach(() => {
  cleanup()
  setOnline(true)
})

it('tracks browser online/offline transitions without unmounting the app', async () => {
  render(<PwaProvider><Probe /><PwaStatusRegion /></PwaProvider>)
  expect(screen.getByText('online|not-installable|browser')).toBeTruthy()

  setOnline(false)
  fireEvent(window, new Event('offline'))
  await waitFor(() => expect(screen.getByText('offline|not-installable|browser')).toBeTruthy())
  expect(screen.getByText(/Draft editing can continue/)).toBeTruthy()

  setOnline(true)
  fireEvent(window, new Event('online'))
  await waitFor(() => expect(screen.getByText('online|not-installable|browser')).toBeTruthy())
})

it('captures the install prompt and invokes the browser installer only after user action', async () => {
  const prompt = vi.fn().mockResolvedValue(undefined)
  const event = new Event('beforeinstallprompt', { cancelable: true }) as Event & {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted'; platform: string }>
  }
  event.prompt = prompt
  event.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' })

  render(<PwaProvider><Probe /><PwaInstallCard /></PwaProvider>)
  fireEvent(window, event)

  await waitFor(() => expect(screen.getByText('online|installable|browser')).toBeTruthy())
  fireEvent.click(screen.getByRole('button', { name: 'Install BulkText' }))

  await waitFor(() => expect(prompt).toHaveBeenCalledTimes(1))
  await waitFor(() => expect(screen.getByText('online|not-installable|installed')).toBeTruthy())
})

it('does not expose an install button when the browser has not provided an install prompt', () => {
  render(<PwaProvider><PwaInstallCard /></PwaProvider>)
  expect(screen.queryByRole('button', { name: 'Install BulkText' })).toBeNull()
  expect(screen.getByText(/Install app \/ Add to Home Screen/)).toBeTruthy()
})
