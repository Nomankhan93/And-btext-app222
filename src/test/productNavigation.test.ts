import { describe, expect, it } from 'vitest'
import { primaryNavigation, secondaryNavigation, workflowRoutes } from '../lib/productNavigation'

describe('mobile-first product navigation', () => {
  it('keeps the primary navigation focused on the three main workflow destinations', () => {
    expect(primaryNavigation.map((item) => item.label)).toEqual([
      'Dashboard',
      'Campaigns',
      'Phone & SIM',
    ])
  })

  it('keeps workflow tools and settings reachable as secondary navigation', () => {
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

  it('keeps all navigation hrefs unique', () => {
    const hrefs = [...primaryNavigation, ...secondaryNavigation].map((item) => item.href)
    expect(new Set(hrefs).size).toBe(hrefs.length)
  })
})
