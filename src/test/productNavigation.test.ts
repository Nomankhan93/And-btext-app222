import { describe, expect, it } from 'vitest'
import { mobilePrimaryNavigation, primaryNavigation, secondaryNavigation, workflowRoutes } from '../lib/productNavigation'

describe('mobile-first product navigation', () => {
  it('keeps the desktop primary navigation focused on the three main workflow destinations', () => {
    expect(primaryNavigation.map((item) => item.label)).toEqual([
      'Dashboard',
      'Campaigns',
      'Phone & SIM',
    ])
  })

  it('uses Home, Campaigns and Phone & SIM as the three direct mobile destinations', () => {
    expect(mobilePrimaryNavigation.map((item) => item.label)).toEqual([
      'Home',
      'Campaigns',
      'Phone & SIM',
    ])
    expect(mobilePrimaryNavigation.map((item) => item.href)).toEqual([
      '/dashboard',
      '/campaigns',
      '/devices',
    ])
  })

  it('keeps workflow tools and settings reachable through the Tools sheet', () => {
    expect(secondaryNavigation.map((item) => item.label)).toEqual([
      'Recipient imports',
      'Consent / do-not-send',
      'Message drafts',
      'Settings',
    ])
    expect(secondaryNavigation.map((item) => item.href)).toEqual([
      workflowRoutes.recipients,
      workflowRoutes.consent,
      workflowRoutes.composer,
      '/settings',
    ])
  })

  it('keeps all navigation hrefs unique across canonical desktop destinations', () => {
    const hrefs = [...primaryNavigation, ...secondaryNavigation].map((item) => item.href)
    expect(new Set(hrefs).size).toBe(hrefs.length)
  })
})
