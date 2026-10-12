export interface BulkTextServiceWorkerHandle {
  registration: ServiceWorkerRegistration
  checkForUpdate: () => Promise<void>
}

interface RegisterOptions {
  onWaiting: (worker: ServiceWorker) => void
  onError?: (error: unknown) => void
}

export async function registerBulkTextServiceWorker({ onWaiting, onError }: RegisterOptions): Promise<BulkTextServiceWorkerHandle | null> {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return null

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', { scope: '/' })

    if (registration.waiting) onWaiting(registration.waiting)

    registration.addEventListener('updatefound', () => {
      const installing = registration.installing
      if (!installing) return
      installing.addEventListener('statechange', () => {
        if (installing.state === 'installed' && navigator.serviceWorker.controller) onWaiting(installing)
      })
    })

    return {
      registration,
      checkForUpdate: async () => {
        try {
          await registration.update()
          if (registration.waiting) onWaiting(registration.waiting)
        } catch (error) {
          onError?.(error)
        }
      },
    }
  } catch (error) {
    onError?.(error)
    return null
  }
}
