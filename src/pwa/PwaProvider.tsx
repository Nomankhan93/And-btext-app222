import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react'
import { registerBulkTextServiceWorker, type BulkTextServiceWorkerHandle } from './registerServiceWorker'

type InstallOutcome = 'accepted' | 'dismissed' | 'unavailable'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

interface PwaContextValue {
  online: boolean
  installed: boolean
  canInstall: boolean
  updateAvailable: boolean
  install: () => Promise<InstallOutcome>
  applyUpdate: () => void
  dismissUpdate: () => void
  checkForUpdate: () => Promise<void>
}

function isStandalone() {
  if (typeof window === 'undefined') return false
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean }
  return window.matchMedia?.('(display-mode: standalone)').matches === true || navigatorWithStandalone.standalone === true
}

const fallbackValue: PwaContextValue = {
  online: typeof navigator === 'undefined' ? true : navigator.onLine,
  installed: isStandalone(),
  canInstall: false,
  updateAvailable: false,
  install: async () => 'unavailable',
  applyUpdate: () => undefined,
  dismissUpdate: () => undefined,
  checkForUpdate: async () => undefined,
}

const PwaContext = createContext<PwaContextValue>(fallbackValue)

export function PwaProvider({ children }: PropsWithChildren) {
  const [online, setOnline] = useState(() => navigator.onLine)
  const [installed, setInstalled] = useState(isStandalone)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)
  const [updateDismissed, setUpdateDismissed] = useState(false)
  const serviceWorkerHandle = useRef<BulkTextServiceWorkerHandle | null>(null)
  const reloadForUpdate = useRef(false)

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    const handleInstalled = () => {
      setInstalled(true)
      setInstallPrompt(null)
    }
    const handleInstallPrompt = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent
      promptEvent.preventDefault()
      setInstallPrompt(promptEvent)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('appinstalled', handleInstalled)
    window.addEventListener('beforeinstallprompt', handleInstallPrompt)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('appinstalled', handleInstalled)
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
    }
  }, [])

  useEffect(() => {
    let active = true
    void registerBulkTextServiceWorker({
      onWaiting(worker) {
        if (!active) return
        setWaitingWorker(worker)
        setUpdateDismissed(false)
      },
      onError() {
        // PWA registration failure must never block the authenticated web workflow.
      },
    }).then((handle) => {
      if (active) serviceWorkerHandle.current = handle
    })

    function handleControllerChange() {
      if (!reloadForUpdate.current) return
      reloadForUpdate.current = false
      window.location.reload()
    }

    navigator.serviceWorker?.addEventListener('controllerchange', handleControllerChange)
    return () => {
      active = false
      navigator.serviceWorker?.removeEventListener('controllerchange', handleControllerChange)
    }
  }, [])

  useEffect(() => {
    function checkWhenVisible() {
      if (document.visibilityState === 'visible') void serviceWorkerHandle.current?.checkForUpdate()
    }
    document.addEventListener('visibilitychange', checkWhenVisible)
    return () => document.removeEventListener('visibilitychange', checkWhenVisible)
  }, [])

  const install = useCallback(async (): Promise<InstallOutcome> => {
    if (!installPrompt || installed) return 'unavailable'
    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    setInstallPrompt(null)
    if (choice.outcome === 'accepted') setInstalled(true)
    return choice.outcome
  }, [installPrompt, installed])

  const applyUpdate = useCallback(() => {
    if (!waitingWorker) return
    reloadForUpdate.current = true
    waitingWorker.postMessage({ type: 'SKIP_WAITING' })
  }, [waitingWorker])

  const dismissUpdate = useCallback(() => setUpdateDismissed(true), [])
  const checkForUpdate = useCallback(async () => {
    await serviceWorkerHandle.current?.checkForUpdate()
  }, [])

  const value = useMemo<PwaContextValue>(() => ({
    online,
    installed,
    canInstall: Boolean(installPrompt) && !installed,
    updateAvailable: Boolean(waitingWorker) && !updateDismissed,
    install,
    applyUpdate,
    dismissUpdate,
    checkForUpdate,
  }), [online, installed, installPrompt, waitingWorker, updateDismissed, install, applyUpdate, dismissUpdate, checkForUpdate])

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>
}

export function usePwa() {
  return useContext(PwaContext)
}
