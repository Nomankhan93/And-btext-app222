import { describe, expect, it } from 'vitest'
import { errorDiagnosticContext, errorMessage } from '../lib/errors'

describe('errorMessage', () => {
  it('preserves intentional user-safe application errors', () => {
    expect(errorMessage(new Error('No unique valid Pakistan mobile numbers were found in this file.'), 'Fallback')).toBe(
      'No unique valid Pakistan mobile numbers were found in this file.',
    )
  })

  it('does not expose PostgREST details, hints, codes or table names for permission failures', () => {
    const message = errorMessage({
      message: 'permission denied for table organizations',
      details: 'RLS rejected the request for public.organizations',
      hint: 'Check membership policy org_members_select',
      code: '42501',
    }, 'Could not load organizations.')

    expect(message).toBe('You do not have permission to perform this action.')
    expect(message).not.toContain('organizations')
    expect(message).not.toContain('RLS')
    expect(message).not.toContain('42501')
  })

  it('preserves safe backend validation messages without appending diagnostics', () => {
    expect(errorMessage({
      message: 'Message template cannot exceed 4000 characters',
      details: 'validate_message_template(text) rejected p_message',
      hint: 'Trim p_message',
      code: '22023',
    }, 'Could not save message draft.')).toBe('Message template cannot exceed 4000 characters')
  })

  it('normalizes network failures into actionable product copy', () => {
    expect(errorMessage(new TypeError('Failed to fetch'), 'Could not load campaigns.')).toBe(
      'Could not reach BulkText. Check your internet connection and try again.',
    )
  })

  it('normalizes expired authentication failures', () => {
    expect(errorMessage({ message: 'JWT expired', code: 'PGRST301', status: 401 }, 'Could not load your account.')).toBe(
      'Authentication required. Sign in again and retry.',
    )
  })

  it('falls back for server failures even when their message looks user-readable', () => {
    expect(errorMessage({ message: 'Unexpected database failure for workspace 123', status: 500 }, 'Could not load your workspace.')).toBe(
      'Could not load your workspace.',
    )
  })

  it('falls back instead of surfacing internal SQL/schema failures', () => {
    expect(errorMessage({
      message: 'column "workspace_id" does not exist',
      details: 'SQLSTATE 42703 in public.get_workspace()',
      code: '42703',
    }, 'Could not load your workspace.')).toBe('Could not load your workspace.')
  })

  it('preserves safe plain-string domain errors', () => {
    expect(errorMessage('Pairing code is invalid or expired', 'Could not pair this phone.')).toBe('Pairing code is invalid or expired')
  })

  it('uses the fallback for unknown values', () => {
    expect(errorMessage({ unexpected: true }, 'Workspace could not be created.')).toBe('Workspace could not be created.')
  })
})

describe('errorDiagnosticContext', () => {
  it('keeps raw backend diagnostics available separately from user-facing copy', () => {
    expect(errorDiagnosticContext({
      name: 'PostgrestError',
      message: 'permission denied for table organizations',
      details: 'RLS rejected the request',
      hint: 'Check membership',
      code: '42501',
      status: 403,
    })).toEqual({
      name: 'PostgrestError',
      message: 'permission denied for table organizations',
      details: 'RLS rejected the request',
      hint: 'Check membership',
      code: '42501',
      status: '403',
    })
  })
})
