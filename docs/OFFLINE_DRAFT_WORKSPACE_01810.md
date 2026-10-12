# Web 0.18.10 — Advanced Offline Draft Workspace

BulkText Web 0.18.10 adds durable browser-local campaign draft storage without changing the server send/delivery contract.

## Storage model

- `sessionStorage` remains a fast same-tab recovery layer.
- IndexedDB database `bulktext-offline-drafts` stores the durable campaign draft for browser/tab closure recovery.
- Draft keys remain scoped to `userId + workspaceId`.
- Durable drafts include campaign name, parsed CSV/XLSX recipient rows, mapping, evidence reference, prepared recipient snapshot references, locally cached personalization rows, message text, and server draft identity when one exists.
- Unprepared bulk-consent checkbox state is intentionally **not** restored. The user must reconfirm consent after recovering an unprepared draft.
- Signing out or explicitly discarding the draft clears both tab storage and IndexedDB campaign drafts.

## Offline boundary

Offline mode is a draft workspace only. It does not create an offline sending path.

Allowed offline:
- edit campaign name;
- parse/select CSV or XLSX recipient files locally;
- edit message text for a previously prepared recipient snapshot;
- inspect the locally restored import/message draft.

Blocked offline:
- recipient import/preview/consent/snapshot server preparation;
- saving a message draft to the account for review;
- campaign confirmation;
- authorization, queueing, recovery, Phone & SIM mutations, or SMS sending.

No Background Sync or service-worker mutation replay is introduced.

## Reconnect reconciliation

When connectivity returns and a prepared snapshot exists, BulkText refreshes the immutable prepared recipient personalization rows from the server. Local message edits are retained. The user must explicitly choose **Review campaign** before local message changes are written to the server draft.

This design prevents local offline state from masquerading as current server/send state.
