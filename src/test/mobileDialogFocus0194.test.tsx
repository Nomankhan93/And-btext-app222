// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { secondaryNavigation } from '../lib/productNavigation'

vi.mock('../auth/AuthProvider', () => ({
  useAuth: () => ({ user: { email: 'owner@example.com' }, signOut: vi.fn() }),
}))

afterEach(cleanup)

function renderShell() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<div>Dashboard body</div>} />
          <Route path="/imports" element={<div>Imports body</div>} />
          <Route path="/consent-suppression" element={<div>Consent body</div>} />
          <Route path="/composer" element={<div>Drafts body</div>} />
          <Route path="/settings" element={<div>Settings body</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

function openTools() {
  const navigation = screen.getByRole('navigation', { name: 'Mobile navigation' })
  const trigger = within(navigation).getByRole('button', { name: 'Tools' })
  trigger.focus()
  fireEvent.click(trigger)
  const dialog = screen.getByRole('dialog', { name: 'More BulkText tools' })
  return { trigger, dialog }
}

it('moves focus into the Tools dialog when it opens', () => {
  const { dialog } = openToolsAfterRender()
  const closeButton = within(dialog).getByRole('button', { name: 'Close tools' })

  expect(document.activeElement).toBe(closeButton)
})

function openToolsAfterRender() {
  renderShell()
  return openTools()
}

it('wraps Tab and Shift+Tab within the Tools dialog', () => {
  const { dialog } = openToolsAfterRender()
  const closeButton = within(dialog).getByRole('button', { name: 'Close tools' })
  const lastLink = within(dialog).getByRole('link', { name: secondaryNavigation[secondaryNavigation.length - 1].label })

  lastLink.focus()
  fireEvent.keyDown(lastLink, { key: 'Tab' })
  expect(document.activeElement).toBe(closeButton)

  closeButton.focus()
  fireEvent.keyDown(closeButton, { key: 'Tab', shiftKey: true })
  expect(document.activeElement).toBe(lastLink)
})

it('restores focus to the Tools trigger after Escape and keeps routed content mounted', () => {
  const { trigger } = openToolsAfterRender()

  fireEvent.keyDown(window, { key: 'Escape' })

  expect(screen.queryByRole('dialog', { name: 'More BulkText tools' })).toBeNull()
  expect(document.activeElement).toBe(trigger)
  expect(screen.getByText('Dashboard body')).toBeTruthy()
})

it('restores focus to the Tools trigger after the close button is used', () => {
  const { trigger, dialog } = openToolsAfterRender()
  fireEvent.click(within(dialog).getByRole('button', { name: 'Close tools' }))

  expect(screen.queryByRole('dialog', { name: 'More BulkText tools' })).toBeNull()
  expect(document.activeElement).toBe(trigger)
})

it('keeps backdrop out of the tab order while preserving pointer dismissal', () => {
  const { trigger } = openToolsAfterRender()
  const backdrop = screen.getByRole('button', { name: 'Dismiss tools' })

  expect(backdrop.getAttribute('tabindex')).toBe('-1')
  fireEvent.click(backdrop)

  expect(screen.queryByRole('dialog', { name: 'More BulkText tools' })).toBeNull()
  expect(document.activeElement).toBe(trigger)
})

it('preserves secondary navigation, closes the dialog and restores trigger focus', () => {
  const { trigger, dialog } = openToolsAfterRender()
  fireEvent.click(within(dialog).getByRole('link', { name: 'Settings' }))

  expect(screen.getByText('Settings body')).toBeTruthy()
  expect(screen.queryByRole('dialog', { name: 'More BulkText tools' })).toBeNull()
  expect(document.activeElement).toBe(trigger)
  expect(trigger.className).toContain('active')
})
