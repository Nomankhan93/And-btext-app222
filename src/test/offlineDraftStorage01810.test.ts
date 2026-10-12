// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it } from 'vitest'
import { parseCsvText } from '../lib/importFiles'
import {
  campaignDraftKey,
  clearCampaignDrafts,
  readCampaignDraftPersistent,
  removeCampaignDraft,
  writeCampaignDraftPersistent,
  type CampaignLocalDraft,
} from '../lib/campaignDraftStorage'

const rows = new Map<string, unknown>()
let storeCreated = false
const originalIndexedDb = globalThis.indexedDB

function asyncRequest<T>(value: () => T) {
  const request: Record<string, unknown> = { result: undefined, error: null, onsuccess: null, onerror: null }
  setTimeout(() => {
    try {
      request.result = value()
      ;(request.onsuccess as null | (() => void))?.()
    } catch (error) {
      request.error = error
      ;(request.onerror as null | (() => void))?.()
    }
  }, 0)
  return request
}

function installFakeIndexedDb() {
  const database = {
    objectStoreNames: { contains: () => storeCreated },
    createObjectStore: () => { storeCreated = true; return {} },
    transaction: () => ({
      objectStore: () => ({
        get: (key: string) => asyncRequest(() => rows.get(key)),
        put: (value: { key: string }) => asyncRequest(() => { rows.set(value.key, value); return value.key }),
        delete: (key: string) => asyncRequest(() => { rows.delete(key); return undefined }),
        clear: () => asyncRequest(() => { rows.clear(); return undefined }),
      }),
    }),
    close: () => undefined,
  }
  const factory = {
    open: () => {
      const request: Record<string, unknown> = { result: database, error: null, onupgradeneeded: null, onsuccess: null, onerror: null, onblocked: null }
      setTimeout(() => {
        if (!storeCreated) (request.onupgradeneeded as null | (() => void))?.()
        ;(request.onsuccess as null | (() => void))?.()
      }, 0)
      return request
    },
  }
  Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: factory })
}

const parsedImport = parseCsvText('Name,Mobile\nAli,03001234567', { fileName: 'offline.csv', fileSha256: 'c'.repeat(64) })
const draft: CampaignLocalDraft = {
  campaignName: 'Offline campaign',
  messageTemplate: 'Hello {{name}}',
  parsed: parsedImport,
  mapping: { phone: 'Mobile', firstName: null, lastName: null, displayName: 'Name' },
  evidenceReference: 'Local import',
  prepared: { importId: 'import', previewId: 'preview', snapshotId: 'snapshot', includedRows: 1, eligibleRows: 1, suppressedRows: 0 },
  draftId: 'server-draft',
  personalizationRows: [{ eligibilityRowId: 1, previewRowId: 2, sourceRowNumber: 2, displayName: 'Ali', firstName: 'Ali', lastName: null, normalizedE164: '+923001234567', customFields: {} }],
}

beforeEach(() => {
  rows.clear()
  storeCreated = false
  sessionStorage.clear()
  installFakeIndexedDb()
})

afterEach(() => {
  sessionStorage.clear()
  if (originalIndexedDb === undefined) delete (globalThis as { indexedDB?: IDBFactory }).indexedDB
  else Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: originalIndexedDb })
})

it('persists a campaign draft outside sessionStorage and restores it after tab storage is cleared', async () => {
  const key = campaignDraftKey('user-a', 'workspace-a')
  const updatedAt = await writeCampaignDraftPersistent(key, draft)
  expect(updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)

  sessionStorage.clear()
  const restored = await readCampaignDraftPersistent(key)
  expect(restored?.draft).toEqual(draft)
  expect(restored?.updatedAt).toBe(updatedAt)
  expect(await readCampaignDraftPersistent(campaignDraftKey('user-b', 'workspace-a'))).toBeNull()
})

it('removes durable drafts on discard and sign-out cleanup without touching unrelated session data', async () => {
  const key = campaignDraftKey('user-a', 'workspace-a')
  await writeCampaignDraftPersistent(key, draft)
  removeCampaignDraft(key)
  await new Promise((resolve) => setTimeout(resolve, 10))
  expect(await readCampaignDraftPersistent(key)).toBeNull()

  await writeCampaignDraftPersistent(key, draft)
  sessionStorage.setItem('unrelated', 'keep')
  clearCampaignDrafts()
  await new Promise((resolve) => setTimeout(resolve, 10))
  expect(await readCampaignDraftPersistent(key)).toBeNull()
  expect(sessionStorage.getItem('unrelated')).toBe('keep')
})
