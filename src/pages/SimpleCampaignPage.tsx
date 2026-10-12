import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { errorMessage } from '../lib/errors'
import { MAX_IMPORT_ROWS, parseSpreadsheetFile, type ParsedImportFile } from '../lib/importFiles'
import {
  buildImportPreview,
  detectSmartImportMapping,
  type ImportColumnMapping,
  type SmartImportDetection,
} from '../lib/importMapping'
import { createContactImport } from '../lib/importsApi'
import { createRecipientPreview, listImportValidationRows } from '../lib/recipientPreviewApi'
import { defaultRecipientSelection } from '../lib/recipientPreview'
import {
  createRecipientEligibilitySnapshot,
  getRecipientEligibilitySnapshotRows,
  recordRecipientPreviewBulkConsent,
} from '../lib/consentSuppressionApi'
import { getMessagePersonalizationSourceRows, saveMessageComposerDraft } from '../lib/messageComposerApi'
import { analyzeMessageTemplate } from '../lib/messageComposer'
import { estimatePersonalizedSmsUsage } from '../lib/smsSegments'
import { useWorkspace } from '../workspace/WorkspaceProvider'

import { useAuth } from '../auth/AuthProvider'
import { campaignDraftKey, readCampaignDraft, readCampaignDraftPersistent, writeCampaignDraft, writeCampaignDraftPersistent, removeCampaignDraft, type CampaignLocalDraft, type PreparedCampaignRecipients } from '../lib/campaignDraftStorage'
import { useOperationGuard } from '../lib/useOperationGuard'
import { usePwa } from '../pwa/PwaProvider'

const emptyMapping: ImportColumnMapping = { phone: '', firstName: null, lastName: null, displayName: null }

function bytesLabel(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function optionalHeader(value: string): string | null {
  return value || null
}

function localTimeLabel(value: string | null) {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function SimpleCampaignPage() {
  const { user } = useAuth()
  const { workspace } = useWorkspace()
  if (!user || !workspace) return null
  const storageKey = campaignDraftKey(user.id, workspace.id)
  return <CampaignForm key={storageKey} storageKey={storageKey} />
}

function CampaignForm({ storageKey }: { storageKey: string }) {
  const { workspace } = useWorkspace()
  const { online } = usePwa()
  const navigate = useNavigate()
  const [sessionRestored] = useState(() => readCampaignDraft(storageKey))
  const operation = useOperationGuard()
  const saveQueue = useRef<Promise<unknown>>(Promise.resolve())
  const saveGeneration = useRef(0)
  const interactedBeforeHydration = useRef(false)
  const persistenceEnabled = useRef(true)
  const [localHydrated, setLocalHydrated] = useState(Boolean(sessionRestored))
  const [localSaveState, setLocalSaveState] = useState<'loading' | 'saving' | 'saved' | 'failed'>(sessionRestored ? 'saving' : 'loading')
  const [localSavedAt, setLocalSavedAt] = useState<string | null>(null)
  const [reconciledAt, setReconciledAt] = useState<string | null>(null)
  const [draftId, setDraftId] = useState<string | null>(sessionRestored?.draftId ?? null)
  const [restoreAttempt, setRestoreAttempt] = useState(0)
  const [restoreFailed, setRestoreFailed] = useState(false)
  const [restoring, setRestoring] = useState(Boolean(sessionRestored?.prepared && online))
  const preparation = useRef<{ signature: string; importId?: string; previewId?: string; snapshotId?: string; grants?: number }>({ signature: '' })
  const fileRef = useRef<HTMLInputElement>(null)
  const [campaignName, setCampaignName] = useState(sessionRestored?.campaignName ?? '')
  const [parsed, setParsed] = useState<ParsedImportFile | null>(sessionRestored?.parsed ?? null)
  const [detection, setDetection] = useState<SmartImportDetection | null>(() => sessionRestored?.parsed ? detectSmartImportMapping(sessionRestored.parsed) : null)
  const [mapping, setMapping] = useState<ImportColumnMapping>(sessionRestored?.mapping ?? emptyMapping)
  const [consentConfirmed, setConsentConfirmed] = useState(Boolean(sessionRestored?.prepared))
  const [evidenceReference, setEvidenceReference] = useState(sessionRestored?.evidenceReference ?? '')
  const [prepared, setPrepared] = useState<PreparedCampaignRecipients | null>(sessionRestored?.prepared ?? null)
  const [messageTemplate, setMessageTemplate] = useState(sessionRestored?.messageTemplate ?? '')
  const [personalizationRows, setPersonalizationRows] = useState<Awaited<ReturnType<typeof getMessagePersonalizationSourceRows>>>(sessionRestored?.personalizationRows ?? [])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(sessionRestored ? 'Recovered your campaign from this browser tab. A durable device copy will keep it available after the tab closes.' : null)

  function applyLocalDraft(draft: CampaignLocalDraft) {
    setCampaignName(draft.campaignName)
    setParsed(draft.parsed)
    setDetection(draft.parsed ? detectSmartImportMapping(draft.parsed) : null)
    setMapping(draft.mapping)
    setConsentConfirmed(Boolean(draft.prepared))
    setEvidenceReference(draft.evidenceReference)
    setPrepared(draft.prepared)
    setMessageTemplate(draft.messageTemplate)
    setPersonalizationRows(draft.personalizationRows ?? [])
    setDraftId(draft.draftId)
  }

  useEffect(() => {
    if (sessionRestored) return
    let cancelled = false
    setLocalSaveState('loading')
    void readCampaignDraftPersistent(storageKey).then((record) => {
      if (cancelled) return
      if (record && !interactedBeforeHydration.current) {
        applyLocalDraft(record.draft)
        setLocalSavedAt(record.updatedAt)
        setLocalSaveState('saved')
        setNotice('Recovered your campaign from this device. Reconnect before recipient preparation, review or sending.')
      } else {
        if (record && interactedBeforeHydration.current) setNotice('A previously saved device draft was left untouched because you already started editing this form.')
        setLocalSaveState('saving')
      }
      setLocalHydrated(true)
    })
    return () => { cancelled = true }
  // The storage key remounts CampaignForm when account/workspace changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  useEffect(() => () => { persistenceEnabled.current = false }, [])

  useEffect(() => {
    if (!localHydrated || !persistenceEnabled.current) return
    const value: CampaignLocalDraft = {
      campaignName,
      parsed,
      mapping,
      evidenceReference,
      prepared,
      personalizationRows,
      messageTemplate,
      draftId,
    }
    // Keep same-tab reload recovery synchronous while IndexedDB provides durable storage.
    writeCampaignDraft(storageKey, value)
    const generation = ++saveGeneration.current
    setLocalSaveState('saving')
    const timer = window.setTimeout(() => {
      if (!persistenceEnabled.current) return
      saveQueue.current = saveQueue.current.then(async () => {
        const updatedAt = await writeCampaignDraftPersistent(storageKey, value)
        if (!persistenceEnabled.current || generation !== saveGeneration.current) return
        if (updatedAt) {
          setLocalSavedAt(updatedAt)
          setLocalSaveState('saved')
        } else {
          setLocalSaveState('failed')
        }
      })
    }, 180)
    return () => window.clearTimeout(timer)
  }, [localHydrated, storageKey, campaignName, parsed, mapping, evidenceReference, prepared, personalizationRows, messageTemplate, draftId])

  useEffect(() => {
    if (!localHydrated || !prepared || !workspace) return
    if (!online) {
      setRestoring(false)
      setRestoreFailed(false)
      return
    }
    let cancelled = false
    setRestoring(true)
    setRestoreFailed(false)
    void getMessagePersonalizationSourceRows(workspace.id, prepared.snapshotId)
      .then((rows) => {
        if (cancelled) return
        setPersonalizationRows(rows)
        setReconciledAt(new Date().toISOString())
      })
      .catch((reason) => {
        if (cancelled) return
        setRestoreFailed(true)
        if (personalizationRows.length === 0) setError(errorMessage(reason, 'Could not refresh prepared recipients. Retry when you are online.'))
      })
      .finally(() => { if (!cancelled) setRestoring(false) })
    return () => { cancelled = true }
  // Re-run after reconnect or an explicit retry; the prepared snapshot itself is immutable.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localHydrated, prepared?.snapshotId, workspace?.id, online, restoreAttempt])

  useEffect(() => {
    function warn(event: BeforeUnloadEvent) {
      if (busy || localSaveState === 'saving' || (localSaveState === 'failed' && (campaignName || messageTemplate || parsed))) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [busy, localSaveState, campaignName, messageTemplate, parsed])

  async function discard() {
    if (!window.confirm('Discard this device’s campaign draft? Saved imports, consent records and server drafts are retained.')) return
    persistenceEnabled.current = false
    saveGeneration.current += 1
    await saveQueue.current
    removeCampaignDraft(storageKey)
    navigate('/campaigns')
  }

  function changeRecipients() {
    preparation.current = { signature: '' }
    setPrepared(null); setPersonalizationRows([]); setDraftId(null); setConsentConfirmed(false)
    setNotice('Choose or remap your recipient list, then confirm consent again. Your message is preserved.')
    if (fileRef.current) fileRef.current.value = ''
  }

  const preview = useMemo(() => parsed ? buildImportPreview(parsed, mapping) : null, [parsed, mapping])
  const uniqueReady = preview ? Math.max(0, preview.summary.validPhoneRows - preview.summary.duplicatePhoneRows) : 0
  const templateAnalysis = useMemo(() => analyzeMessageTemplate(messageTemplate), [messageTemplate])
  const usage = useMemo(() => estimatePersonalizedSmsUsage(messageTemplate, personalizationRows), [messageTemplate, personalizationRows])
  const canPrepare = Boolean(
    online && workspace && parsed && mapping.phone && !parsed.truncated && uniqueReady > 0 && consentConfirmed && campaignName.trim(),
  )
  const canReview = Boolean(
    online && !restoring && !restoreFailed && prepared && campaignName.trim() && messageTemplate.trim() && !templateAnalysis.malformed && templateAnalysis.unsupportedTokens.length === 0 && usage.readyRecipients > 0 && usage.blockedRecipients === 0,
  )
  const currentStep = !parsed ? 1 : !prepared ? 2 : canReview ? 4 : 3

  async function selectFile(file: File | null) {
    if (!file || !operation.start()) return
    setError(null)
    setNotice(null)
    setBusy(true)
    try {
      const next = await parseSpreadsheetFile(file)
      operation.check()
      preparation.current = { signature: '' }
      setPrepared(null); setDraftId(null); setPersonalizationRows([]); setConsentConfirmed(false)
      const smart = detectSmartImportMapping(next)
      setParsed(next)
      setDetection(smart)
      setMapping(smart.mapping)
      setEvidenceReference(`Imported list: ${file.name}`)
    } catch (reason) {
      if (!operation.active.current) return
      setError(errorMessage(reason, 'Could not read the recipient file.'))
      if (fileRef.current) fileRef.current.value = ''
    } finally {
      operation.finish()
      if (operation.active.current) setBusy(false)
    }
  }

  async function prepareRecipients() {
    if (!online) { setError('Reconnect to prepare recipients. Imports and edits can stay local while offline.'); return }
    if (!workspace || !parsed || !preview || !canPrepare || !operation.start()) return
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      const signature = JSON.stringify([parsed.fileSha256, mapping, campaignName, evidenceReference])
      if (preparation.current.signature !== signature) preparation.current = { signature }
      const progress = preparation.current
      const importId = progress.importId ?? await createContactImport(workspace.id, parsed, mapping, preview.rows)
      progress.importId = importId
      operation.check()
      const validationRows = await listImportValidationRows(workspace.id, importId)
      operation.check()
      const selected = [...defaultRecipientSelection(validationRows)].sort((a, b) => a - b)
      if (selected.length === 0) throw new Error('No unique valid Pakistan mobile numbers were found in this file.')

      const previewId = progress.previewId ?? await createRecipientPreview(workspace.id, importId, selected)
      progress.previewId = previewId
      operation.check()
      const evidenceNote = `Bulk consent declaration for campaign “${campaignName.trim()}”. The account owner confirmed that recipients in the uploaded list may receive this campaign.`
      if (progress.grants === undefined) {
        const bulkConsent = await recordRecipientPreviewBulkConsent({
        organizationId: workspace.id,
        previewId,
        source: 'import',
        evidenceNote,
        evidenceReference: evidenceReference.trim() || `Imported list: ${parsed.fileName}`,
      })
      operation.check()
      progress.grants = bulkConsent.newGrantEvents
      }
      const snapshotId = progress.snapshotId ?? await createRecipientEligibilitySnapshot(workspace.id, previewId)
      progress.snapshotId = snapshotId
      operation.check()
      const [snapshotRows, sourceRows] = await Promise.all([
        getRecipientEligibilitySnapshotRows(workspace.id, snapshotId),
        getMessagePersonalizationSourceRows(workspace.id, snapshotId),
      ])
      operation.check()
      const eligibleRows = snapshotRows.filter((row) => row.eligibilityState === 'eligible').length
      const suppressedRows = snapshotRows.filter((row) => row.suppressionState === 'suppressed').length
      if (eligibleRows === 0) throw new Error('No recipients are eligible after the do-not-send and consent checks.')
      setPrepared({ importId, previewId, snapshotId, includedRows: selected.length, eligibleRows, suppressedRows })
      setPersonalizationRows(sourceRows)
      setReconciledAt(new Date().toISOString())
      setNotice(`${eligibleRows.toLocaleString()} recipient${eligibleRows === 1 ? '' : 's'} ready for this campaign. ${progress.grants.toLocaleString()} consent grant${progress.grants === 1 ? '' : 's'} recorded; ${suppressedRows.toLocaleString()} suppressed.`)
    } catch (reason) {
      if (!operation.active.current) return
      setError(errorMessage(reason, 'Could not prepare campaign recipients.'))
    } finally {
      operation.finish()
      if (operation.active.current) setBusy(false)
    }
  }

  async function reviewCampaign() {
    if (!online) { setError('Reconnect to save this draft to your account and continue to review.'); return }
    if (!workspace || !prepared || !canReview || !operation.start()) return
    setBusy(true)
    setError(null)
    try {
      const savedId = await saveMessageComposerDraft({
        organizationId: workspace.id,
        draftId,
        eligibilitySnapshotId: prepared.snapshotId,
        title: campaignName.trim(),
        messageTemplate,
      })
      operation.check()
      setDraftId(savedId)
      const finalLocalDraft: CampaignLocalDraft = {
        campaignName,
        parsed,
        mapping,
        evidenceReference,
        prepared,
        personalizationRows,
        messageTemplate,
        draftId: savedId,
      }
      writeCampaignDraft(storageKey, finalLocalDraft)
      await writeCampaignDraftPersistent(storageKey, finalLocalDraft)
      navigate(`/campaigns/review/${savedId}`)
    } catch (reason) {
      if (!operation.active.current) return
      setError(errorMessage(reason, 'Could not save the campaign draft.'))
    } finally {
      operation.finish()
      if (operation.active.current) setBusy(false)
    }
  }

  if (!workspace) return null

  const savedTime = localTimeLabel(localSavedAt)
  const reconciledTime = localTimeLabel(reconciledAt)

  return (
    <div className="page-stack simple-campaign-page" onChangeCapture={() => { if (!localHydrated) interactedBeforeHydration.current = true }}>
      <section className="page-heading recipient-heading">
        <div>
          <p className="eyebrow">New campaign</p>
          <h1>Create campaign</h1>
          <p>Name it, upload a CSV/XLSX list with column headers, write the message and review. BulkText handles number detection, normalization, duplicates, consent declaration and suppression checks behind the scenes.</p>
        </div>
        <div className="button-row"><Link className="secondary-button" to="/campaigns">Back to campaigns</Link><button type="button" className="secondary-button" disabled={busy || restoring} onClick={() => void discard()}>Discard draft</button></div>
      </section>

      <section className="draft-storage-status" aria-label="Offline draft status">
        <div>
          <strong>{localSaveState === 'loading' ? 'Checking saved device draft…' : localSaveState === 'failed' ? 'Local draft storage unavailable' : localSaveState === 'saving' ? 'Saving locally…' : 'Saved on this device'}</strong>
          <span>{localSaveState === 'saved' && savedTime ? `Last local save ${savedTime}. ` : ''}Uploaded recipient data and message edits stay scoped to this account/workspace in this browser. Signing out or discarding clears the local campaign draft.</span>
        </div>
        <span className={`badge ${localSaveState === 'failed' ? 'badge-warning' : localSaveState === 'loading' ? 'badge-muted' : 'badge-success'}`}>{localSaveState === 'loading' ? 'Checking' : localSaveState === 'failed' ? 'Tab only' : online ? 'Local draft' : 'Offline draft'}</span>
      </section>
      {localSaveState === 'failed' ? <div role="alert" className="notice warning-notice">Durable browser storage is blocked or unavailable. Same-tab recovery may still work, but keep this page open until you reconnect and save for review.</div> : null}
      {!online ? <div className="notice warning-notice" role="status"><strong>Offline draft mode.</strong> You can edit the campaign name, import a CSV/XLSX file and continue editing a previously prepared message. Reconnect to prepare recipients, save for review or send.</div> : null}
      {reconciledTime ? <p className="muted-copy draft-reconciled-copy">Prepared recipient details last refreshed from the server at {reconciledTime}. Local message edits are not sent to the server until you choose Review campaign.</p> : null}
      {restoreFailed && prepared && online ? <button className="secondary-button" type="button" disabled={restoring} onClick={() => { setError(null); setRestoreAttempt((value) => value + 1) }}>Retry prepared recipients</button> : null}
      {restoring ? <div role="status" className="notice">Refreshing prepared recipients from the server…</div> : null}
      {error ? <div className="notice error-notice">{error}</div> : null}
      {notice ? <div className="notice success-notice">{notice}</div> : null}

      <ol className="simple-stepper" aria-label="Campaign progress">
        <li className={currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''} aria-current={currentStep === 1 ? 'step' : undefined}><span>1</span><strong>Campaign</strong></li>
        <li className={currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''} aria-current={currentStep === 2 ? 'step' : undefined}><span>2</span><strong>Recipients</strong></li>
        <li className={currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : ''} aria-current={currentStep === 3 ? 'step' : undefined}><span>3</span><strong>Message</strong></li>
        <li className={currentStep === 4 ? 'active' : ''} aria-current={currentStep === 4 ? 'step' : undefined}><span>4</span><strong>Review</strong></li>
      </ol>

      <section className="panel simple-campaign-section">
        <div className="panel-heading"><div><p className="eyebrow">Step 1</p><h2>Campaign name</h2></div></div>
        <label className="field simple-campaign-name-field"><span>Name</span><input disabled={busy || restoring} value={campaignName} maxLength={120} onChange={(event) => setCampaignName(event.target.value)} placeholder="October customer update" /></label>
      </section>

      <section className="panel simple-campaign-section">
        <div className="panel-heading"><div><p className="eyebrow">Step 2</p><h2>Upload recipient list</h2><p className="muted-copy">We primarily need the mobile-number column. Names and other fields are optional.</p></div><span className="badge badge-muted">CSV · XLSX · max 5 MB / {MAX_IMPORT_ROWS.toLocaleString()} rows</span></div>
        <div className="import-upload-zone">
          <label className="import-file-label">
            <strong>{busy && !parsed ? 'Reading file…' : 'Choose CSV or XLSX'}</strong>
            <span>BulkText looks at both the column name and the actual values to find Pakistan mobile numbers.</span>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" disabled={busy || restoring || Boolean(prepared)} onChange={(event) => void selectFile(event.target.files?.[0] ?? null)} />
          </label>
        </div>

        {parsed && preview && detection ? <>
          <section className="simple-import-file-card" aria-label="Imported recipient file summary">
            <div className="simple-import-file-heading">
              <div><p className="eyebrow">Selected file</p><h3>{parsed.fileName}</h3><p>{bytesLabel(parsed.fileSizeBytes)}{parsed.sheetName ? ` · ${parsed.sheetName}` : ''}</p></div>
              <span className={`badge ${uniqueReady > 0 ? 'badge-success' : 'badge-warning'}`}>{uniqueReady.toLocaleString()} ready</span>
            </div>
            <dl className="simple-import-stats">
              <div><dt>Rows</dt><dd>{parsed.sourceRowCount.toLocaleString()}</dd></div>
              <div><dt>Valid numbers</dt><dd>{preview.summary.validPhoneRows.toLocaleString()}</dd></div>
              <div><dt>Duplicates</dt><dd>{preview.summary.duplicatePhoneRows.toLocaleString()}</dd></div>
              <div><dt>Invalid</dt><dd>{preview.summary.invalidPhoneRows.toLocaleString()}</dd></div>
            </dl>
          </section>
          <div className={detection.confidence === 'low' ? 'notice warning-notice' : 'notice success-notice'}>
            <strong>Smart detection:</strong> {detection.message}
          </div>
          {parsed.sheetName ? <p className="muted-copy">Only worksheet “{parsed.sheetName}” is imported. Move the intended sheet first or export it as CSV to use another sheet.</p> : null}
          <details className="mobile-data-details"><summary>Preview first {Math.min(preview.rows.length, 10)} recipient rows</summary><div className="table-wrap"><table className="data-table"><thead><tr><th>Row</th><th>Name</th><th>Number</th><th>Status</th></tr></thead><tbody>{preview.rows.slice(0, 10).map((row) => <tr key={row.sourceRowNumber}><td>{row.sourceRowNumber}</td><td>{row.displayName ?? '—'}</td><td>{row.normalization.normalizedE164 ?? row.rawPhone}</td><td>{row.duplicateInFile ? 'Duplicate — excluded' : row.normalization.validationStatus}</td></tr>)}</tbody></table></div></details>
          {prepared ? <button type="button" className="secondary-button" disabled={busy || restoring} onClick={changeRecipients}>Change recipient list</button> : null}
          {parsed.truncated ? <div className="notice error-notice">This file has more than {MAX_IMPORT_ROWS.toLocaleString()} data rows. Split it before continuing.</div> : null}

          <details className="advanced-mapping" open={!mapping.phone || detection.confidence === 'low'}>
            <summary>Advanced column mapping</summary>
            <div className="import-mapping-grid">
              <label><span>Phone number *</span><select value={mapping.phone} disabled={busy || restoring || Boolean(prepared)} onChange={(event) => { setConsentConfirmed(false); setMapping((current) => ({ ...current, phone: event.target.value })) }}><option value="">Select column…</option>{parsed.headers.map((header) => <option key={header} value={header}>{header}</option>)}</select></label>
              <label><span>Full / display name</span><select value={mapping.displayName ?? ''} disabled={busy || restoring || Boolean(prepared)} onChange={(event) => setMapping((current) => ({ ...current, displayName: optionalHeader(event.target.value) }))}><option value="">Not mapped</option>{parsed.headers.map((header) => <option key={header} value={header}>{header}</option>)}</select></label>
              <label><span>First name</span><select value={mapping.firstName ?? ''} disabled={busy || restoring || Boolean(prepared)} onChange={(event) => setMapping((current) => ({ ...current, firstName: optionalHeader(event.target.value) }))}><option value="">Not mapped</option>{parsed.headers.map((header) => <option key={header} value={header}>{header}</option>)}</select></label>
              <label><span>Last name</span><select value={mapping.lastName ?? ''} disabled={busy || restoring || Boolean(prepared)} onChange={(event) => setMapping((current) => ({ ...current, lastName: optionalHeader(event.target.value) }))}><option value="">Not mapped</option>{parsed.headers.map((header) => <option key={header} value={header}>{header}</option>)}</select></label>
            </div>
            {detection.phoneCandidates.length > 1 ? <p className="muted-copy">Other possible number columns: {detection.phoneCandidates.slice(1).map((item) => item.header).join(', ')}.</p> : null}
          </details>

          <div className="bulk-consent-declaration">
            <label className="consent-check"><input type="checkbox" checked={consentConfirmed} disabled={busy || restoring || Boolean(prepared)} onChange={(event) => setConsentConfirmed(event.target.checked)} /><span><strong>I confirm these recipients have agreed to receive this campaign.</strong><small>This records one auditable bulk declaration against the included recipient snapshot. Existing do-not-send blocks still win.</small></span></label>
            <label className="field"><span>Evidence / list reference (optional)</span><input value={evidenceReference} disabled={busy || restoring || Boolean(prepared)} maxLength={500} onChange={(event) => setEvidenceReference(event.target.value)} placeholder="CRM export, customer list, signup form batch…" /></label>
          </div>

          {!prepared ? <div className="button-row"><button className="primary-button" type="button" disabled={busy || !canPrepare} onClick={() => void prepareRecipients()}>{busy ? 'Preparing…' : `Continue with ${uniqueReady.toLocaleString()} unique numbers`}</button></div> : null}
        </> : null}
      </section>

      {prepared ? <section className="panel simple-campaign-section">
        <div className="panel-heading"><div><p className="eyebrow">Step 3</p><h2>Write message</h2></div><span className="badge badge-success">{prepared.eligibleRows.toLocaleString()} ready</span></div>
        {prepared.suppressedRows > 0 ? <div className="notice warning-notice">{prepared.suppressedRows.toLocaleString()} recipient{prepared.suppressedRows === 1 ? ' is' : 's are'} on the do-not-send list and will not receive this campaign.</div> : null}
        <label className="field simple-message-field"><span>SMS message</span><textarea rows={8} maxLength={4000} disabled={busy || restoring} value={messageTemplate} onChange={(event) => setMessageTemplate(event.target.value)} placeholder="Type your message…" /><small>Personalization is optional. Use <code>{'{{name}}'}</code> only when the uploaded file contains names.</small></label>
        {templateAnalysis.malformed ? <div className="notice error-notice">Message contains malformed <code>{'{{…}}'}</code> braces.</div> : null}
        {templateAnalysis.unsupportedTokens.length ? <div className="notice error-notice">Unsupported variables: {templateAnalysis.unsupportedTokens.join(', ')}</div> : null}
        <div className="metric-grid simple-message-metrics">
          <article className="metric-card"><span>Recipients</span><h2>{usage.readyRecipients.toLocaleString()}</h2><p>Complete personalized messages.</p></article>
          <article className="metric-card"><span>Estimated SMS units</span><h2>{usage.estimatedSmsUnits.toLocaleString()}</h2><p>{usage.encodingSummary}</p></article>
          <article className="metric-card"><span>Segments</span><h2>{usage.maximumSegments || 0}</h2><p>Maximum per recipient in the current message.</p></article>
        </div>
        {usage.blockedRecipients > 0 ? <div className="notice warning-notice">{usage.blockedRecipients.toLocaleString()} recipient{usage.blockedRecipients === 1 ? '' : 's'} cannot render the selected personalization variables. Remove the variable or provide that data.</div> : null}
        <div className="button-row"><button className="primary-button" type="button" disabled={busy || !canReview} onClick={() => void reviewCampaign()}>{busy ? 'Saving…' : 'Review campaign'}</button></div>
      </section> : null}

      <section className="notice warning-notice"><strong>Safety stays automatic:</strong> invalid/duplicate numbers are excluded, do-not-send always overrides the bulk consent declaration, and final confirmation still freezes the recipient/message/SIM snapshot before queueing.</section>
    </div>
  )
}
