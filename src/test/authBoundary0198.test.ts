import { describe, expect, it } from 'vitest'
import { protectedReturnTo, safeReturnTo } from '../auth/returnTo'

describe('0.19.8 protected return targets', () => {
  it('preserves an exact internal protected path, search and hash', () => {
    const target = protectedReturnTo({ pathname: '/campaigns', search: '?status=active', hash: '#queued' })
    expect(target).toBe('/campaigns?status=active#queued')
    expect(safeReturnTo(target)).toBe(target)
  })

  it('rejects external, protocol-relative, backslash and auth-loop return targets', () => {
    expect(safeReturnTo('https://example.com/steal')).toBe('/dashboard')
    expect(safeReturnTo('//example.com/steal')).toBe('/dashboard')
    expect(safeReturnTo('/\\example.com/steal')).toBe('/dashboard')
    expect(safeReturnTo('/auth/login?returnTo=/campaigns')).toBe('/dashboard')
  })
})
