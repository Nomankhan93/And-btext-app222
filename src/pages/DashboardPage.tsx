import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { errorMessage } from '../lib/errors'
import { listGatewayDevices, type GatewayDeviceSummary } from '../lib/gatewayDevices'
import { listContactImports, type ContactImportSummary } from '../lib/importsApi'
import { listMessageComposerDrafts, listMessageComposerSources, type MessageComposerDraft, type MessageComposerSource } from '../lib/messageComposerApi'
import { workflowRoutes } from '../lib/productNavigation'
import { useWorkspace } from '../workspace/WorkspaceProvider'
import { PwaInstallCard } from '../components/PwaStatus'

interface DashboardData {
  devices: GatewayDeviceSummary[]
  imports: ContactImportSummary[]
  sources: MessageComposerSource[]
  drafts: MessageComposerDraft[]
}

const emptyData: DashboardData = { devices: [], imports: [], sources: [], drafts: [] }

function phoneName(device: GatewayDeviceSummary | undefined) {
  if (!device) return 'Not paired'
  return [device.manufacturer, device.model].filter(Boolean).join(' ') || device.displayName
}

export function DashboardPage() {
  const { user } = useAuth()
  const { workspace } = useWorkspace()
  const displayName = String(user?.user_metadata?.display_name ?? '').trim()
  const [data, setData] = useState<DashboardData>(emptyData)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!workspace) return
    let cancelled = false
    setLoading(true)
    setLoadError(null)
    void Promise.all([
      listGatewayDevices(workspace.id),
      listContactImports(workspace.id),
      listMessageComposerSources(workspace.id),
      listMessageComposerDrafts(workspace.id),
    ])
      .then(([devices, imports, sources, drafts]) => {
        if (!cancelled) setData({ devices, imports, sources, drafts })
      })
      .catch((reason) => {
        if (!cancelled) setLoadError(errorMessage(reason, 'Could not load your current setup.'))
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [workspace])

  const activeDevice = useMemo(() => data.devices.find((device) => device.status === 'active'), [data.devices])
  const selectedSource = data.sources[0]
  const selectedSim = activeDevice?.bindingStatus === 'ready'
    ? activeDevice.boundCarrierName || `SIM ${(activeDevice.boundSlotIndex ?? 0) + 1}`
    : activeDevice?.bindingStatus === 'missing'
      ? 'Selected SIM missing'
      : 'Not selected'

  const phoneReady = Boolean(activeDevice && activeDevice.bindingStatus === 'ready')
  const recipientsReady = Boolean(selectedSource && selectedSource.eligibleRows > 0)
  const messageReady = data.drafts.length > 0
  const nextAction = loading
    ? { eyebrow: 'Checking setup', title: 'Finding your next action…', copy: 'BulkText is checking the paired phone, selected SIM and saved campaign preparation.', label: 'Checking…', href: '/dashboard', disabled: true }
    : !phoneReady
      ? { eyebrow: 'Next action', title: activeDevice ? 'Select a ready SIM' : 'Pair your Android phone', copy: activeDevice ? 'Your phone is paired, but sending stays blocked until a currently present SIM is explicitly selected.' : 'Connect the Android gateway first, then choose the exact SIM BulkText may use.', label: activeDevice ? 'Review Phone & SIM' : 'Pair phone', href: '/devices', disabled: false }
      : { eyebrow: 'Next action', title: 'Create a campaign', copy: `Your sending phone is ready: ${phoneName(activeDevice)} · ${selectedSim}. Upload recipients, write the message and review the exact send snapshot.`, label: 'New campaign', href: '/campaigns/new', disabled: false }

  return (
    <div className="page-stack dashboard-page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">My BulkText</p>
          <h1>{displayName ? `Welcome, ${displayName}` : 'Welcome'}</h1>
          <p>Send a campaign from your browser through the exact Android phone and SIM you selected.</p>
        </div>
        <Link className="primary-button desktop-heading-action" to="/campaigns/new">+ New campaign</Link>
      </section>

      {loadError ? <section role="alert" className="notice warning-notice">{loadError}</section> : null}

      <PwaInstallCard compact />

      <section className="panel dashboard-next-action" aria-labelledby="dashboard-next-title">
        <div>
          <p className="eyebrow">{nextAction.eyebrow}</p>
          <h2 id="dashboard-next-title">{nextAction.title}</h2>
          <p>{nextAction.copy}</p>
        </div>
        {nextAction.disabled ? <span className="secondary-button disabled-action" aria-disabled="true">{nextAction.label}</span> : <Link className="primary-button" to={nextAction.href}>{nextAction.label}</Link>}
      </section>

      <section className="metric-grid dashboard-module-grid" aria-label="Setup status">
        <article className="metric-card dashboard-status-card">
          <span>{loading ? 'Checking…' : phoneReady ? 'Ready' : activeDevice ? 'Needs attention' : 'Not connected'}</span>
          <h2>Phone &amp; SIM</h2>
          <p>{loading ? 'Checking your Android phone…' : activeDevice ? `${phoneName(activeDevice)} · ${selectedSim}` : 'No Android gateway is paired yet.'}</p>
          <Link className="card-action-link" to="/devices">{activeDevice ? 'Review phone' : 'Pair phone'}</Link>
        </article>

        <article className="metric-card dashboard-status-card">
          <span>{loading ? 'Checking…' : recipientsReady ? 'Ready' : data.imports.length ? 'Needs review' : 'Not started'}</span>
          <h2>Recipient preparation</h2>
          <p>{loading ? 'Checking recipient preparation…' : recipientsReady ? `${selectedSource.eligibleRows} recipient${selectedSource.eligibleRows === 1 ? '' : 's'} available in your latest prepared source.` : data.imports.length ? 'An uploaded list still needs validation or eligibility review.' : 'No saved recipient import yet.'}</p>
          <Link className="card-action-link" to={workflowRoutes.recipients}>{data.imports.length ? 'Review imports' : 'Open imports'}</Link>
        </article>

        <article className="metric-card dashboard-status-card">
          <span>{loading ? 'Checking…' : messageReady ? 'Drafts saved' : 'No saved draft'}</span>
          <h2>Message drafts</h2>
          <p>{loading ? 'Checking message drafts…' : messageReady ? `${data.drafts.length} saved message draft${data.drafts.length === 1 ? '' : 's'} available.` : 'Campaign creation can write the message inline; saved drafts remain available as a secondary tool.'}</p>
          <Link className="card-action-link" to={workflowRoutes.composer}>{messageReady ? 'Open drafts' : 'Message drafts'}</Link>
        </article>
      </section>

      <section className="panel dashboard-setup-panel">
        <div className="panel-heading"><div><p className="eyebrow">Sending setup</p><h2>Current identity</h2></div><span className={`badge ${phoneReady ? 'badge-success' : 'badge-warning'}`}>{phoneReady ? 'Ready to review campaigns' : 'Setup required'}</span></div>
        <dl className="definition-grid">
          <div><dt>Phone</dt><dd>{phoneName(activeDevice)}</dd></div>
          <div><dt>Selected SIM</dt><dd>{selectedSim}</dd></div>
          <div><dt>Recipient source</dt><dd>{selectedSource ? `${selectedSource.eligibleRows} ready` : 'None prepared'}</dd></div>
        </dl>
      </section>
    </div>
  )
}
