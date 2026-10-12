# Web 0.18.6-r1 — Phone & SIM Live Status Sync

Frontend-only correction to Web 0.18.6; backend contract remains 0.18.5. No migration, Android change, SMS send or deployment is part of applying the patch.

The Phone & SIM page previously fetched only on mount and Web-side operations. Android pairing/inventory changes therefore needed manual Web refresh.

The page now polls its existing authenticated device and pairing-session readers five seconds after the previous pass finishes while visible. Focus, visible-tab return and network restoration request an immediate refresh. Refresh triggers are coalesced while a pass is running; hidden tabs stop their timer. Browser throttling and network latency can delay updates, so five seconds is a polling interval, not a delivery deadline.

Existing cards remain visible during background refresh and transient failures. Failures show a retry notice. Web-side mutations pause the reader and invalidate its previous response; completion triggers a fresh snapshot. Workspace changes remount the page, clearing private pairing-code state and discarding old responses. Same-workspace context refresh does not erase the code. Claimed, expired or revoked sessions clear their displayed raw code. Manual Refresh remains available.

Only reads run automatically. SIM binding remains explicit. Pairing, SIM detection, selection and recent contact do not imply the gateway worker is actively running, or that SMS has been sent/delivered. Existing authorization, queue, callback and UNKNOWN rules are unchanged.

Vitest discovery is restricted to src/test/**/*.test.{ts,tsx}; patch backups cannot contribute stale tests.

## Validation and acceptance

Run npm ci, npm run validate and sha256sum -c SHA256SUMS.txt. No Supabase db push/reset is required. Deploy the Web frontend through the normal workflow after local validation; local source changes do not update an already deployed site.

On a deployed/staged page: keep Phone & SIM open, pair Android, grant phone permissions, publish inventory, select a SIM, switch tabs and return, and briefly disconnect/reconnect the browser network. Verify device/SIM changes appear without manual refresh, selection stays explicit and failed refresh preserves loaded details. This physical-device/hosted acceptance was not performed in the build workspace.

The uploaded clean ZIP omitted .env.example. The patch preserves it and retains its existing checksum entry; it does not distribute a replacement template or any environment credentials.
