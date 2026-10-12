# Web 0.18.10 — Advanced Offline Draft Workspace

BulkText Web `0.18.10` upgrades campaign draft recovery to a durable browser-local workspace using IndexedDB. Parsed CSV/XLSX recipient data, prepared personalization rows and message edits can survive tab/browser closure, while reconnect reconciliation refreshes prepared recipient details without overwriting local message edits.

This remains a **draft-only** offline capability. Recipient preparation, server review/save, campaign confirmation, queueing, recovery and SMS sending still require a live connection. Unprepared consent confirmation is deliberately not persisted and must be reconfirmed after restoration.

Frontend version is `0.18.10`; backend contract remains `0.18.5`. There is no database migration or Android change.

See `PATCH_0_18_10_README.md`, `VALIDATION_0_18_10.md`, `HANDOFF_0_18_10.md` and `docs/OFFLINE_DRAFT_WORKSPACE_01810.md`.
