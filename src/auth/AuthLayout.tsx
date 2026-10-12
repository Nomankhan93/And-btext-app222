import type { PropsWithChildren, ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function AuthLayout({ title, subtitle, children, footer }: PropsWithChildren<{ title: string; subtitle: string; footer?: ReactNode }>) {
  return (
    <main className="auth-shell">
      <section className="auth-brand-panel" aria-label="About BulkText">
        <Link className="auth-logo-link" to="/" aria-label="BulkText home">
          <img src="/branding/bulktext-logo.png" alt="BulkText — Your SIM. Your Messages. Your Reach." />
        </Link>
        <div className="auth-brand-message">
          <p className="marketing-kicker">SIM-powered business messaging</p>
          <h2>Use the Android phone and SIM you already control.</h2>
          <p>Manage recipients, campaigns, exact SIM routing and live send and delivery status from one focused workspace.</p>
        </div>
        <div className="auth-benefit-list" aria-label="BulkText benefits">
          <span>Exact phone + SIM selection</span>
          <span>CSV/Excel recipient import</span>
          <span>Delivery &amp; recovery tracking</span>
        </div>
      </section>

      <section className="auth-card-wrap">
        <section className="auth-card">
          <Link className="auth-mobile-brand" to="/" aria-label="BulkText home">
            <img src="/icons/icon-192.png" alt="" aria-hidden="true" />
            <span><strong>BulkText</strong><small>Your SIM. Your Messages. Your Reach.</small></span>
          </Link>
          <div className="auth-heading">
            <p className="eyebrow">BulkText account</p>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          {children}
          {footer ? <div className="auth-footer">{footer}</div> : null}
        </section>
      </section>
    </main>
  )
}
