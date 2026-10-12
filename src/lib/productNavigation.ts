export const primaryNavigation = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Campaigns', href: '/campaigns' },
  { label: 'Phone & SIM', href: '/devices' },
] as const

export const secondaryNavigation = [
  { label: 'Recipient imports', href: '/imports' },
  { label: 'Consent / do-not-send', href: '/consent-suppression' },
  { label: 'Message drafts', href: '/composer' },
  { label: 'Settings', href: '/settings' },
] as const

export const workflowRoutes = {
  recipients: '/imports',
  consent: '/consent-suppression',
  composer: '/composer',
} as const
