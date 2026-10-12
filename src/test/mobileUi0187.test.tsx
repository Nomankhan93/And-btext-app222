// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { mobilePrimaryNavigation, secondaryNavigation } from '../lib/productNavigation'

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
          <Route path="/campaigns" element={<div>Campaigns body</div>} />
          <Route path="/devices" element={<div>Phone body</div>} />
          <Route path="/imports" element={<div>Imports body</div>} />
          <Route path="/consent-suppression" element={<div>Consent body</div>} />
          <Route path="/composer" element={<div>Drafts body</div>} />
          <Route path="/settings" element={<div>Settings body</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

it('exposes Home, Campaigns, Phone & SIM and expandable Tools in the mobile bottom navigation', () => {
  renderShell()
  const mobileNavigation = screen.getByRole('navigation', { name: 'Mobile navigation' })

  for (const item of mobilePrimaryNavigation) {
    expect(within(mobileNavigation).getByRole('link', { name: item.label }).getAttribute('href')).toBe(item.href)
  }

  const tools = within(mobileNavigation).getByRole('button', { name: 'Tools' })
  expect(tools.getAttribute('aria-expanded')).toBe('false')
  fireEvent.click(tools)
  expect(tools.getAttribute('aria-expanded')).toBe('true')

  const sheet = screen.getByRole('dialog', { name: 'More BulkText tools' })
  const toolNavigation = within(sheet).getByRole('navigation', { name: 'Mobile tools' })
  for (const item of secondaryNavigation) {
    expect(within(toolNavigation).getByRole('link', { name: item.label }).getAttribute('href')).toBe(item.href)
  }
})

it('closes the Tools sheet with Escape without unmounting routed content', () => {
  renderShell()
  const mobileNavigation = screen.getByRole('navigation', { name: 'Mobile navigation' })
  const tools = within(mobileNavigation).getByRole('button', { name: 'Tools' })

  fireEvent.click(tools)
  fireEvent.keyDown(window, { key: 'Escape' })

  expect(tools.getAttribute('aria-expanded')).toBe('false')
  expect(screen.queryByRole('dialog', { name: 'More BulkText tools' })).toBeNull()
  expect(screen.getByText('Dashboard body')).toBeTruthy()
})

it('closes Tools after navigating to a secondary destination and marks Tools active', () => {
  renderShell()
  const mobileNavigation = screen.getByRole('navigation', { name: 'Mobile navigation' })
  const tools = within(mobileNavigation).getByRole('button', { name: 'Tools' })

  fireEvent.click(tools)
  const sheet = screen.getByRole('dialog', { name: 'More BulkText tools' })
  fireEvent.click(within(sheet).getByRole('link', { name: 'Settings' }))

  expect(screen.getByText('Settings body')).toBeTruthy()
  expect(screen.queryByRole('dialog', { name: 'More BulkText tools' })).toBeNull()
  expect(tools.className).toContain('active')
})
