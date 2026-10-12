// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { primaryNavigation, secondaryNavigation } from '../lib/productNavigation'

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
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

it('keeps the mobile menu labelled, expanded-state aware, and exposes primary plus secondary destinations', () => {
  renderShell()
  const menu = screen.getByRole('button', { name: 'Open navigation' })
  expect(menu.getAttribute('aria-expanded')).toBe('false')
  fireEvent.click(menu)
  expect(screen.getByRole('button', { name: 'Close navigation' }).getAttribute('aria-expanded')).toBe('true')
  expect(screen.getByRole('navigation', { name: 'Primary navigation' })).toBeTruthy()
  expect(screen.getByRole('navigation', { name: 'Secondary tools' })).toBeTruthy()
  for (const item of [...primaryNavigation, ...secondaryNavigation]) {
    expect(screen.getByRole('link', { name: item.label }).getAttribute('href')).toBe(item.href)
  }
})

it('closes the navigation with Escape without unmounting routed content', () => {
  renderShell()
  fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }))
  fireEvent.keyDown(window, { key: 'Escape' })
  expect(screen.getByRole('button', { name: 'Open navigation' }).getAttribute('aria-expanded')).toBe('false')
  expect(screen.getByText('Dashboard body')).toBeTruthy()
})
