import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { primaryNavigation, secondaryNavigation } from '../lib/productNavigation'

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!menuOpen) return
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [menuOpen])

  async function logout() {
    await signOut()
    navigate('/auth/login', { replace: true })
  }

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="menu-button"
          type="button"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          aria-controls="app-navigation"
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
        </button>
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true">BT</div>
          <div><strong>BulkText</strong><span>SIM-powered business messaging</span></div>
        </div>

        <div className="topbar-actions">
          <div className="account-menu">
            <span title={user?.email ?? ''}>{user?.email ?? 'Account'}</span>
            <button className="text-button" type="button" onClick={() => void logout()}>Sign out</button>
          </div>
        </div>
      </header>

      <div className="shell-body">
        {menuOpen ? <button className="sidebar-backdrop" type="button" aria-label="Dismiss navigation" onClick={closeMenu} /> : null}
        <aside id="app-navigation" className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`} aria-label="Application navigation">
          <nav aria-label="Primary navigation">
            <p className="nav-section-label">Main</p>
            {primaryNavigation.map(({ label, href }) => (
              <NavLink key={href} to={href} onClick={closeMenu} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                {label}
              </NavLink>
            ))}
          </nav>
          <nav className="secondary-nav" aria-label="Secondary tools">
            <p className="nav-section-label">Tools</p>
            {secondaryNavigation.map(({ label, href }) => (
              <NavLink key={href} to={href} onClick={closeMenu} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                {label}
              </NavLink>
            ))}
          </nav>
          <p className="sidebar-footer">Campaign sending always uses the explicitly selected phone and SIM.</p>
        </aside>

        <main className="content"><Outlet /></main>
      </div>
    </div>
  )
}
