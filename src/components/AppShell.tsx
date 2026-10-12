import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { mobilePrimaryNavigation, primaryNavigation, secondaryNavigation } from '../lib/productNavigation'
import { PwaStatusRegion } from './PwaStatus'

type MobileIconKind = 'home' | 'campaigns' | 'phone' | 'tools'

function MobileNavIcon({ kind }: { kind: MobileIconKind }) {
  if (kind === 'home') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M3.5 10.7 12 3.8l8.5 6.9v8.8a.7.7 0 0 1-.7.7h-5.1v-6.1H9.3v6.1H4.2a.7.7 0 0 1-.7-.7z" />
      </svg>
    )
  }

  if (kind === 'campaigns') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M5 4.5h14v15H5zM8 8h8M8 12h8M8 16h5" />
      </svg>
    )
  }

  if (kind === 'phone') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="6.5" y="2.8" width="11" height="18.4" rx="2.2" />
        <path d="M10 5.8h4M10.4 18.2h3.2" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="5" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="19" cy="12" r="1.4" />
    </svg>
  )
}

export function AppShell() {
  const [toolsOpen, setToolsOpen] = useState(false)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const toolsActive = secondaryNavigation.some(({ href }) => location.pathname === href || location.pathname.startsWith(`${href}/`))

  useEffect(() => {
    setToolsOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!toolsOpen) return
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setToolsOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [toolsOpen])

  async function logout() {
    await signOut()
    navigate('/auth/login', { replace: true })
  }

  function closeTools() {
    setToolsOpen(false)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
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

      <PwaStatusRegion />

      <div className="shell-body">
        <aside className="sidebar" aria-label="Application navigation">
          <nav aria-label="Primary navigation">
            <p className="nav-section-label">Main</p>
            {primaryNavigation.map(({ label, href }) => (
              <NavLink key={href} to={href} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                {label}
              </NavLink>
            ))}
          </nav>
          <nav className="secondary-nav" aria-label="Secondary tools">
            <p className="nav-section-label">Tools</p>
            {secondaryNavigation.map(({ label, href }) => (
              <NavLink key={href} to={href} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                {label}
              </NavLink>
            ))}
          </nav>
          <p className="sidebar-footer">Campaign sending always uses the explicitly selected phone and SIM.</p>
        </aside>

        <main className="content"><Outlet /></main>
      </div>

      {toolsOpen ? (
        <>
          <button className="mobile-tools-backdrop" type="button" aria-label="Dismiss tools" onClick={closeTools} />
          <section
            id="mobile-tools-sheet"
            className="mobile-tools-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-tools-title"
          >
            <div className="mobile-tools-heading">
              <div>
                <p className="eyebrow">Tools</p>
                <h2 id="mobile-tools-title">More BulkText tools</h2>
              </div>
              <button className="mobile-tools-close" type="button" aria-label="Close tools" onClick={closeTools}>×</button>
            </div>
            <nav className="mobile-tools-links" aria-label="Mobile tools">
              {secondaryNavigation.map(({ label, href }) => (
                <NavLink key={href} to={href} onClick={closeTools} className={({ isActive }) => (isActive ? 'mobile-tool-link active' : 'mobile-tool-link')}>
                  <span>{label}</span>
                  <span aria-hidden="true">›</span>
                </NavLink>
              ))}
            </nav>
          </section>
        </>
      ) : null}

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {mobilePrimaryNavigation.map(({ label, href, icon }) => (
          <NavLink key={href} to={href} onClick={closeTools} className={({ isActive }) => (isActive ? 'mobile-nav-item active' : 'mobile-nav-item')}>
            <MobileNavIcon kind={icon} />
            <span>{label}</span>
          </NavLink>
        ))}
        <button
          className={`mobile-nav-item mobile-tools-trigger ${toolsActive ? 'active' : ''}`}
          type="button"
          aria-label="Tools"
          aria-expanded={toolsOpen}
          aria-controls="mobile-tools-sheet"
          aria-haspopup="dialog"
          onClick={() => setToolsOpen((value) => !value)}
        >
          <MobileNavIcon kind="tools" />
          <span>Tools</span>
        </button>
      </nav>
    </div>
  )
}
