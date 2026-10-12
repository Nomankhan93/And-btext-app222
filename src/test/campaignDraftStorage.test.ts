// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { campaignDraftKey, readCampaignDraft, writeCampaignDraft, clearCampaignDrafts, type CampaignLocalDraft } from '../lib/campaignDraftStorage'
const draft: CampaignLocalDraft = { campaignName: 'Campaign', messageTemplate: ' Hello ', parsed: null, mapping: { phone: '', firstName: null, lastName: null, displayName: null }, evidenceReference: '', prepared: null, draftId: null }
afterEach(() => { vi.restoreAllMocks(); sessionStorage.clear() })
it('isolates account and workspace drafts and clears only campaign storage', () => {
  const key = campaignDraftKey('a', 'w')
  expect(writeCampaignDraft(key, draft)).toBe(true)
  expect(readCampaignDraft(key)).toEqual(draft)
  expect(readCampaignDraft(campaignDraftKey('b', 'w'))).toBeNull()
  sessionStorage.setItem('unrelated', 'keep')
  clearCampaignDrafts()
  expect(readCampaignDraft(key)).toBeNull()
  expect(sessionStorage.getItem('unrelated')).toBe('keep')
})
it('removes stale data when quota prevents writing newer edits', () => {
  const key = campaignDraftKey('a', 'w'); writeCampaignDraft(key, draft)
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
  expect(writeCampaignDraft(key, { ...draft, campaignName: 'new' })).toBe(false)
  expect(readCampaignDraft(key)).toBeNull()
})
it('ignores malformed draft JSON', () => {
  sessionStorage.setItem('broken', '{')
  expect(readCampaignDraft('broken')).toBeNull()
})
