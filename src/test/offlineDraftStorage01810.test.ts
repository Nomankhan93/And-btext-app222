// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it } from 'vitest'
import { parseCsvText } from '../lib/importFiles'
import {
  campaignDraftKey,
  clearCampaignDrafts,
  readCampaignDraftPersistent,
  removeCampaignDraft,
  saveCampaignDraftPersistent,
  writeCampaignDraftPersistent,
  type CampaignLocalDraft,
} from '../lib/campaignDraftStorage'

const rows = new Map<string, unknown>()
let storeCreated = false
let abortNextReadwrite = false
const originalIndexedDb = globalThis.indexedDB

function installFakeIndexedDb() {
  const database = {
    objectStoreNames: { contains: () => storeCreated },
    createObjectStore: () => { storeCreated = true; return {} },
    transaction: (_name: string, mode: IDBTransactionMode) => {
      let pending = 0
      let completionTimer: ReturnType<typeof setTimeout> | null = null
      const before = new Map(rows)
      const transaction: Record<string, unknown> = {
        error: null,
        oncomplete: null,
        onabort: null,
        onerror: null,
      }

      function finishLater() {
        if (pending !== 0) return
        if (completionTimer) clearTimeout(completionTimer)
        completionTimer = setTimeout(() => {
          completionTimer = null
          if (pending !== 0) return
          if (mode === 'readwrite' && abortNextReadwrite) {
            abortNextReadwrite = false
            rows.clear()
            for (const [key, value] of before) rows.set(key, value)
            transaction.error = new DOMException('Simulated transaction abort', 'AbortError')
            ;(transaction.onabort as null | (() => void))?.()
            return
          }
          ;(transaction.oncomplete as null | (() => void))?.()
        }, 0)
      }

      function request<T>(action: () => T) {
        pending += 1
        if (completionTimer) {
          clearTimeout(completionTimer)
          completionTimer = null
        }
        const result: Record<string, unknown> = { result: undefined, error: null, onsuccess: null, onerror: null }
        setTimeout(() => {
          try {
            result.result = action()
            ;(result.onsuccess as null | (() => void))?.()
          } catch (error) {
            result.error = error
            ;(result.onerror as null | (() => void))?.()
          } finally {
            pending -= 1
            finishLater()
          }
        }, 0)
        return result
      }

      transaction.objectStore = () => ({
        get: (key: string) => request(() => rows.get(key)),
        put: (value: { key: string }) => request(() => { rows.set(value.key, value); return value.key }),
        delete: (key: string) => request(() => { rows.delete(key); return undefined }),
        clear: () => request(() => { rows.clear(); return undefined }),
      })
      return transaction
    },
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
  abortNextReadwrite = false
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
  expect(restored?.revision).toBe(1)
  expect(await readCampaignDraftPersistent(campaignDraftKey('user-b', 'workspace-a'))).toBeNull()
})

it('refuses a stale revision instead of silently overwriting a newer tab save', async () => {
  const key = campaignDraftKey('user-a', 'workspace-a')
  const first = await saveCampaignDraftPersistent(key, draft, 0)
  expect(first.status).toBe('saved')
  if (first.status !== 'saved') throw new Error('Expected initial save')

  const newer = { ...draft, messageTemplate: 'Newer tab edit' }
  const second = await saveCampaignDraftPersistent(key, newer, first.revision)
  expect(second.status).toBe('saved')

  const stale = await saveCampaignDraftPersistent(key, { ...draft, messageTemplate: 'Stale tab edit' }, first.revision)
  expect(stale.status).toBe('conflict')
  if (stale.status !== 'conflict') throw new Error('Expected conflict')
  expect(stale.current?.draft.messageTemplate).toBe('Newer tab edit')
  expect((await readCampaignDraftPersistent(key))?.draft.messageTemplate).toBe('Newer tab edit')
})

it('does not report saved when the put request succeeds but the transaction later aborts', async () => {
  const key = campaignDraftKey('user-a', 'workspace-a')
  abortNextReadwrite = true
  const result = await saveCampaignDraftPersistent(key, draft, 0)
  expect(result.status).toBe('unavailable')
  expect(await readCampaignDraftPersistent(key)).toBeNull()
})

it('awaits durable discard and sign-out cleanup instead of relying on a delay', async () => {
  const key = campaignDraftKey('user-a', 'workspace-a')
  await writeCampaignDraftPersistent(key, draft)
  expect(await removeCampaignDraft(key)).toBe(true)
  expect(await readCampaignDraftPersistent(key)).toBeNull()

  await writeCampaignDraftPersistent(key, draft)
  sessionStorage.setItem('unrelated', 'keep')
  expect(await clearCampaignDrafts()).toBe(true)
  expect(await readCampaignDraftPersistent(key)).toBeNull()
  expect(sessionStorage.getItem('unrelated')).toBe('keep')
})
