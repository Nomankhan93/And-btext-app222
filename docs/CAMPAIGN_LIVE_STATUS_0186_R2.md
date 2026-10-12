# Web 0.18.6-r2 — Campaign Live Status Consistency

The campaign screen polled callback status but retained its initial queue counts.
This could show 9 delivered beside 9 queued until a full page refresh.

The campaign reader now refreshes callbacks, history and health, followed by the
queue, and publishes them together only when all reads succeed. Polling runs five
seconds after each completed read, so slow requests do not overlap. Focus,
visibility restoration, network reconnection and Refresh campaign status trigger
fresh reads. Hidden/offline tabs pause. Failed reads preserve the last complete
result with a visible retry notice. Campaign/workspace changes remount the page;
mutation pauses invalidate old reader results and resume with a fresh read.
Dispatches created in another tab are discovered even if no queue existed when
this page opened. Sending is disabled until the initial status read completes.
The simple-send heading no longer claims every existing dispatch is still queued.

These are separate read-only RPCs, not a transactional database snapshot. Backend
activity between requests may be reflected on the following refresh. No resend,
authorization, SIM selection, SQL, RLS or Android behavior is changed.

Validation: 9 new tests cover queue-to-ACK-to-delivered, manual refresh, partial
failure/retry, visibility/offline/focus, coalescing/unmount, campaign navigation,
mutation invalidation, externally-created dispatch and actual page rendering.
Hosted deployment and real-device end-to-end verification remain separate.
