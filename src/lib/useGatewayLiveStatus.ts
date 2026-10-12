import { useEffect, useRef, useState } from 'react'
import { listGatewayDevices, listGatewayPairingSessions, type GatewayDeviceSummary, type GatewayPairingSession } from './gatewayDevices'

export const GATEWAY_POLL_MS = 5000

/** Read-only refresh. Callers key the page by workspace; mutations pause this reader. */
export function useGatewayLiveStatus(workspaceId: string, paused: boolean) {
  const [devices, setDevices] = useState<GatewayDeviceSummary[]>([])
  const [sessions, setSessions] = useState<GatewayPairingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const refreshRef = useRef<() => void>(() => {})

  useEffect(() => {
    let disposed = false
    let running = false
    let queued = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const visible = () => document.visibilityState !== 'hidden'
    const clearTimer = () => { if (timer !== undefined) clearTimeout(timer); timer = undefined }
    const refresh = async () => {
      if (disposed || paused || !visible()) return
      clearTimer()
      if (!navigator.onLine) {
        setSyncError('You are offline. Phone status will refresh when the connection returns.')
        setLoading(false)
        return
      }
      if (running) { queued = true; return }
      running = true
      setFetching(true)
      try {
        const [nextDevices, nextSessions] = await Promise.all([
          listGatewayDevices(workspaceId), listGatewayPairingSessions(workspaceId),
        ])
        if (disposed) return
        setDevices(nextDevices)
        setSessions(nextSessions)
        setSyncError(null)
      } catch {
        if (!disposed) setSyncError('Could not refresh phone status. Last loaded details are shown; automatic retry will follow.')
      } finally {
        running = false
        if (!disposed) {
          setLoading(false)
          setFetching(false)
          if (queued) { queued = false; void refresh() }
          else if (visible() && !paused) timer = setTimeout(() => void refresh(), GATEWAY_POLL_MS)
        }
      }
    }
    const wake = () => { if (visible()) void refresh(); else clearTimer() }
    refreshRef.current = wake
    if (paused) setFetching(false)
    else void refresh()
    window.addEventListener('focus', wake)
    window.addEventListener('online', wake)
    window.addEventListener('offline', wake)
    document.addEventListener('visibilitychange', wake)
    return () => {
      disposed = true
      clearTimer()
      refreshRef.current = () => {}
      window.removeEventListener('focus', wake)
      window.removeEventListener('online', wake)
      window.removeEventListener('offline', wake)
      document.removeEventListener('visibilitychange', wake)
    }
  }, [workspaceId, paused])

  return { devices, sessions, loading, fetching, syncError, refresh: () => refreshRef.current() }
}
