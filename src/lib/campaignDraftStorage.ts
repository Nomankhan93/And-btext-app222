import type { ParsedImportFile } from './importFiles'
import type { ImportColumnMapping } from './importMapping'
import type { PersonalizationSourceRow } from './messageComposer'

export interface PreparedCampaignRecipients {
  importId: string
  previewId: string
  snapshotId: string
  includedRows: number
  eligibleRows: number
  suppressedRows: number
}

export interface CampaignLocalDraft {
  campaignName: string
  messageTemplate: string
  parsed: ParsedImportFile | null
  mapping: ImportColumnMapping
  evidenceReference: string
  prepared: PreparedCampaignRecipients | null
  draftId: string | null
  personalizationRows?: PersonalizationSourceRow[]
}

export interface PersistentCampaignDraft {
  draft: CampaignLocalDraft
  updatedAt: string
}

const prefix = 'bulktext:campaign:0186:'
const databaseName = 'bulktext-offline-drafts'
const storeName = 'campaignDrafts'
const databaseVersion = 1
const persistentSchemaVersion = 1
const persistentJsonBudget = 20_000_000
let persistentOperationQueue: Promise<unknown> = Promise.resolve()

function enqueuePersistentOperation<T>(operation: () => Promise<T>): Promise<T> {
  const result = persistentOperationQueue.then(operation, operation)
  persistentOperationQueue = result.then(() => undefined, () => undefined)
  return result
}

interface PersistentDraftRecord {
  key: string
  schemaVersion: number
  updatedAt: string
  draft: CampaignLocalDraft
}

export function campaignDraftKey(userId: string, workspaceId: string) {
  return `${prefix}${userId}:${workspaceId}`
}

function validMapping(mapping: unknown): mapping is ImportColumnMapping {
  if (!mapping || typeof mapping !== 'object') return false
  const value = mapping as Record<string, unknown>
  if (typeof value.phone !== 'string') return false
  return [value.firstName, value.lastName, value.displayName].every((item) => item === null || typeof item === 'string')
}

function validParsedFile(file: unknown): file is ParsedImportFile {
  if (!file || typeof file !== 'object') return false
  const value = file as Record<string, unknown>
  if (!Array.isArray(value.headers) || value.headers.length > 100 || !value.headers.every((header) => typeof header === 'string')) return false
  if (!Array.isArray(value.rows) || value.rows.length > 5000) return false
  if (!value.rows.every((row) => {
    if (!row || typeof row !== 'object') return false
    const candidate = row as { sourceRowNumber?: unknown; values?: unknown }
    return Number.isInteger(candidate.sourceRowNumber)
      && Boolean(candidate.values)
      && typeof candidate.values === 'object'
      && Object.values(candidate.values as Record<string, unknown>).every((cell) => typeof cell === 'string')
  })) return false
  return typeof value.fileName === 'string'
    && typeof value.fileSha256 === 'string'
    && ['csv', 'xlsx'].includes(String(value.fileType))
    && typeof value.fileSizeBytes === 'number'
    && typeof value.sourceRowCount === 'number'
    && typeof value.truncated === 'boolean'
    && (value.sheetName === null || typeof value.sheetName === 'string')
}

function validPrepared(value: unknown): value is PreparedCampaignRecipients {
  if (!value || typeof value !== 'object') return false
  const prepared = value as Record<string, unknown>
  return typeof prepared.snapshotId === 'string'
    && typeof prepared.importId === 'string'
    && typeof prepared.previewId === 'string'
    && [prepared.includedRows, prepared.eligibleRows, prepared.suppressedRows].every((count) => Number.isInteger(count) && Number(count) >= 0)
}

function validPersonalizationRows(value: unknown): value is PersonalizationSourceRow[] {
  if (value === undefined) return true
  if (!Array.isArray(value) || value.length > 5000) return false
  return value.every((row) => {
    if (!row || typeof row !== 'object') return false
    const candidate = row as Record<string, unknown>
    return Number.isInteger(candidate.eligibilityRowId)
      && Number.isInteger(candidate.previewRowId)
      && Number.isInteger(candidate.sourceRowNumber)
      && (candidate.displayName === null || typeof candidate.displayName === 'string')
      && (candidate.firstName === null || typeof candidate.firstName === 'string')
      && (candidate.lastName === null || typeof candidate.lastName === 'string')
      && typeof candidate.normalizedE164 === 'string'
      && Boolean(candidate.customFields)
      && typeof candidate.customFields === 'object'
      && !Array.isArray(candidate.customFields)
  })
}

export function validateCampaignDraft(value: unknown): CampaignLocalDraft | null {
  if (!value || typeof value !== 'object') return null
  const draft = value as Record<string, unknown>
  if (typeof draft.campaignName !== 'string' || typeof draft.messageTemplate !== 'string' || typeof draft.evidenceReference !== 'string') return null
  if (!validMapping(draft.mapping)) return null
  if (!(draft.draftId === null || typeof draft.draftId === 'string')) return null
  if (!(draft.parsed === null || validParsedFile(draft.parsed))) return null
  if (!(draft.prepared === null || validPrepared(draft.prepared))) return null
  if (!validPersonalizationRows(draft.personalizationRows)) return null
  return value as CampaignLocalDraft
}

export function readCampaignDraft(key: string): CampaignLocalDraft | null {
  try {
    return validateCampaignDraft(JSON.parse(sessionStorage.getItem(key) ?? 'null'))
  } catch {
    return null
  }
}

export function writeCampaignDraft(key: string, value: CampaignLocalDraft): boolean {
  try {
    const json = JSON.stringify(value)
    if (json.length > 1_500_000) throw new Error('Draft exceeds tab storage budget')
    sessionStorage.setItem(key, json)
    return true
  } catch {
    // IndexedDB is the durable 0.18.10 store. Never leave stale session data
    // that could temporarily replace a newer persistent draft during hydration.
    try { sessionStorage.removeItem(key) } catch { /* storage unavailable */ }
    return false
  }
}

function openDraftDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null)
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, databaseVersion)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(storeName)) database.createObjectStore(storeName, { keyPath: 'key' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB could not be opened.'))
    request.onblocked = () => reject(new Error('IndexedDB upgrade is blocked by another BulkText tab.'))
  })
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed.'))
  })
}

export async function readCampaignDraftPersistent(key: string): Promise<PersistentCampaignDraft | null> {
  let database: IDBDatabase | null = null
  try {
    database = await openDraftDatabase()
    if (!database) return null
    const transaction = database.transaction(storeName, 'readonly')
    const record = await requestResult(transaction.objectStore(storeName).get(key)) as PersistentDraftRecord | undefined
    if (!record || record.schemaVersion !== persistentSchemaVersion || typeof record.updatedAt !== 'string') return null
    const draft = validateCampaignDraft(record.draft)
    return draft ? { draft, updatedAt: record.updatedAt } : null
  } catch {
    return null
  } finally {
    database?.close()
  }
}

async function writeCampaignDraftPersistentNow(key: string, draft: CampaignLocalDraft): Promise<string | null> {
  let database: IDBDatabase | null = null
  try {
    if (!validateCampaignDraft(draft)) return null
    const json = JSON.stringify(draft)
    if (json.length > persistentJsonBudget) return null
    // JSON cloning normalizes null-prototype import row objects before structured clone.
    const normalized = JSON.parse(json) as CampaignLocalDraft
    const updatedAt = new Date().toISOString()
    database = await openDraftDatabase()
    if (!database) return null
    const transaction = database.transaction(storeName, 'readwrite')
    await requestResult(transaction.objectStore(storeName).put({
      key,
      schemaVersion: persistentSchemaVersion,
      updatedAt,
      draft: normalized,
    } satisfies PersistentDraftRecord))
    return updatedAt
  } catch {
    return null
  } finally {
    database?.close()
  }
}

export function writeCampaignDraftPersistent(key: string, draft: CampaignLocalDraft): Promise<string | null> {
  return enqueuePersistentOperation(() => writeCampaignDraftPersistentNow(key, draft))
}

async function removeCampaignDraftPersistentNow(key: string) {
  let database: IDBDatabase | null = null
  try {
    database = await openDraftDatabase()
    if (!database) return
    const transaction = database.transaction(storeName, 'readwrite')
    await requestResult(transaction.objectStore(storeName).delete(key))
  } catch {
    // Local draft cleanup is best effort; server state must never depend on it.
  } finally {
    database?.close()
  }
}

async function clearPersistentCampaignDraftsNow() {
  let database: IDBDatabase | null = null
  try {
    database = await openDraftDatabase()
    if (!database) return
    const transaction = database.transaction(storeName, 'readwrite')
    await requestResult(transaction.objectStore(storeName).clear())
  } catch {
    // Signing out must continue even if browser storage is unavailable.
  } finally {
    database?.close()
  }
}

function removeCampaignDraftPersistent(key: string) {
  return enqueuePersistentOperation(() => removeCampaignDraftPersistentNow(key))
}

function clearPersistentCampaignDrafts() {
  return enqueuePersistentOperation(() => clearPersistentCampaignDraftsNow())
}

export function removeCampaignDraft(key: string) {
  try { sessionStorage.removeItem(key) } catch { /* storage unavailable */ }
  void removeCampaignDraftPersistent(key)
}

export function clearCampaignDrafts() {
  try {
    for (const key of Object.keys(sessionStorage)) if (key.startsWith(prefix)) sessionStorage.removeItem(key)
  } catch { /* storage unavailable */ }
  void clearPersistentCampaignDrafts()
}
