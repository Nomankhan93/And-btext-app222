export interface OfflineWorkspaceLocator {
  workspaceId: string
  name: string
  slug: string
  verifiedAt: string
}

const locatorPrefix = 'bulktext:workspace-locator:01810r1:'

function key(userId: string) {
  return `${locatorPrefix}${userId}`
}

function validLocator(value: unknown): value is OfflineWorkspaceLocator {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.workspaceId === 'string'
    && candidate.workspaceId.length > 0
    && typeof candidate.name === 'string'
    && typeof candidate.slug === 'string'
    && typeof candidate.verifiedAt === 'string'
}

export function readOfflineWorkspaceLocator(userId: string): OfflineWorkspaceLocator | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(key(userId)) ?? 'null') as unknown
    return validLocator(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function writeOfflineWorkspaceLocator(userId: string, locator: Omit<OfflineWorkspaceLocator, 'verifiedAt'>): boolean {
  try {
    localStorage.setItem(key(userId), JSON.stringify({ ...locator, verifiedAt: new Date().toISOString() }))
    return true
  } catch {
    return false
  }
}

export function clearOfflineWorkspaceLocators() {
  try {
    for (const storageKey of Object.keys(localStorage)) {
      if (storageKey.startsWith(locatorPrefix)) localStorage.removeItem(storageKey)
    }
  } catch {
    // Workspace locators are a convenience for local-draft access only.
  }
}
