import { useEffect, useRef, useState } from 'react'
import { getCampaignDispatch } from './durableQueueApi'
import type { CampaignDispatch } from './durableQueue'
import { getCampaignContractHealth, getCampaignDeliveryStatus, listCampaignMessageAttempts } from './deliveryAttemptsApi'
import type { CampaignDeliveryStatus, CampaignMessageAttempt } from './deliveryAttempts'
import type { DeliveryContractHealth } from './deliveryContract'

export const CAMPAIGN_POLL_MS = 5000

/** The caller keys its component by workspace + campaign. Reads never send SMS. */
export function useCampaignLiveStatus(workspaceId: string, campaignId: string, paused: boolean) {
  const [dispatch, setDispatch] = useState<CampaignDispatch | null>(null)
  const [deliveryStatus, setDeliveryStatus] = useState<CampaignDeliveryStatus | null>(null)
  const [attempts, setAttempts] = useState<CampaignMessageAttempt[]>([])
  const [contractHealth, setContractHealth] = useState<DeliveryContractHealth | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [fetching, setFetching] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const refreshRef = useRef<() => void>(() => {})

  useEffect(() => {
    let disposed = false
    let running = false
    let queued = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const visible = () => document.visibilityState !== 'hidden'
    const clearTimer = () => { clearTimeout(timer); timer = undefined }
    const refresh = async () => {
      if (disposed || paused || !visible()) return
      clearTimer()
      if (!navigator.onLine) {
        setSyncError('You are offline. Last loaded campaign status is shown.')
        return
      }
      if (running) { queued = true; return }
      running = true
      setFetching(true)
      try {
        // Read callbacks first, then queue: an ACK already reflected by callbacks
        // must not be paired with an earlier queue read. These are separate RPCs,
        // not a transactional database snapshot.
        const [status, history, health] = await Promise.all([
          getCampaignDeliveryStatus(workspaceId, campaignId),
          listCampaignMessageAttempts(workspaceId, campaignId, 100),
          getCampaignContractHealth(workspaceId, campaignId),
        ])
        if (disposed) return
        const nextDispatch = await getCampaignDispatch(workspaceId, campaignId)
        if (disposed) return
        setDispatch(nextDispatch)
        setDeliveryStatus(nextDispatch ? status : null)
        setAttempts(nextDispatch ? history : [])
        setContractHealth(nextDispatch ? health : null)
        setLoaded(true)
        setSyncError(null)
      } catch {
        if (!disposed) setSyncError('Could not refresh campaign status. Last loaded details are shown; automatic retry will follow.')
      } finally {
        running = false
        if (!disposed) {
          setFetching(false)
          if (queued) { queued = false; void refresh() }
          else if (!paused && visible()) timer = setTimeout(() => void refresh(), CAMPAIGN_POLL_MS)
        }
      }
    }
    const wake = () => { void refresh() }
    const visibility = () => { clearTimer(); if (visible()) wake() }
    const offline = () => { clearTimer(); setSyncError('You are offline. Last loaded campaign status is shown.') }
    refreshRef.current = wake
    window.addEventListener('focus', wake)
    window.addEventListener('online', wake)
    window.addEventListener('offline', offline)
    document.addEventListener('visibilitychange', visibility)
    wake()
    return () => {
      disposed = true
      clearTimer()
      refreshRef.current = () => {}
      window.removeEventListener('focus', wake)
      window.removeEventListener('online', wake)
      window.removeEventListener('offline', offline)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [workspaceId, campaignId, paused])

  return { dispatch, setDispatch, deliveryStatus, attempts, contractHealth, syncError, fetching, loaded, refresh: () => refreshRef.current() }
}
