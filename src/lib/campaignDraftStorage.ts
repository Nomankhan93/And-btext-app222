import type { ParsedImportFile } from './importFiles'
import type { ImportColumnMapping } from './importMapping'

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
}
const prefix = 'bulktext:campaign:0186:'
export function campaignDraftKey(userId: string, workspaceId: string) { return `${prefix}${userId}:${workspaceId}` }
export function readCampaignDraft(key: string): CampaignLocalDraft | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(key) ?? 'null')
    if (!value || typeof value.campaignName !== 'string' || typeof value.messageTemplate !== 'string' || typeof value.evidenceReference !== 'string' || typeof value.mapping?.phone !== 'string') return null
    if (![value.mapping.firstName, value.mapping.lastName, value.mapping.displayName, value.draftId].every((item) => item === null || typeof item === 'string')) return null
    if (value.parsed) {
      const file = value.parsed
      if (!Array.isArray(file.headers) || file.headers.length > 100 || !file.headers.every((header: unknown) => typeof header === 'string')) return null
      if (!Array.isArray(file.rows) || file.rows.length > 5000 || !file.rows.every((row: { sourceRowNumber?: unknown; values?: unknown }) => row && Number.isInteger(row.sourceRowNumber) && row.values && typeof row.values === 'object' && Object.values(row.values).every((cell) => typeof cell === 'string'))) return null
      if (typeof file.fileName !== 'string' || typeof file.fileSha256 !== 'string' || !['csv', 'xlsx'].includes(file.fileType) || typeof file.fileSizeBytes !== 'number' || typeof file.sourceRowCount !== 'number' || typeof file.truncated !== 'boolean') return null
    }
    if (value.prepared && (typeof value.prepared.snapshotId !== 'string' || typeof value.prepared.importId !== 'string' || typeof value.prepared.previewId !== 'string' || ![value.prepared.includedRows, value.prepared.eligibleRows, value.prepared.suppressedRows].every((count) => Number.isInteger(count) && count >= 0))) return null
    return value as CampaignLocalDraft
  } catch { return null }
}
export function writeCampaignDraft(key: string, value: CampaignLocalDraft): boolean {
  try {
    const json = JSON.stringify(value)
    if (json.length > 1500000) throw new Error('Draft exceeds tab storage budget')
    sessionStorage.setItem(key, json)
    return true
  } catch {
    // Never leave a stale draft that could replace newer edits on reload.
    try { sessionStorage.removeItem(key) } catch { /* storage unavailable */ }
    return false
  }
}
export function removeCampaignDraft(key: string) { try { sessionStorage.removeItem(key) } catch { /* storage unavailable */ } }
export function clearCampaignDrafts() {
  try { for (const key of Object.keys(sessionStorage)) if (key.startsWith(prefix)) sessionStorage.removeItem(key) } catch { /* storage unavailable */ }
}
