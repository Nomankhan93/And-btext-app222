import { Link } from 'react-router-dom'

type BrandLockupProps = {
  to?: string
  compact?: boolean
  showTagline?: boolean
  className?: string
}

export function BrandLockup({ to = '/', compact = false, showTagline = false, className = '' }: BrandLockupProps) {
  const content = (
    <>
      <img className="brand-lockup-icon" src="/icons/icon-192.png" alt="" aria-hidden="true" />
      <span className="brand-lockup-copy">
        <strong>BulkText</strong>
        {showTagline ? <small>Your SIM. Your Messages. Your Reach.</small> : null}
      </span>
    </>
  )

  const classes = `brand-lockup${compact ? ' brand-lockup-compact' : ''}${className ? ` ${className}` : ''}`
  return <Link className={classes} to={to} aria-label="BulkText home">{content}</Link>
}
