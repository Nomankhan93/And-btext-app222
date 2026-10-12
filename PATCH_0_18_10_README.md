# Web 0.18.10 — Advanced Offline Draft Workspace

## Scope

This release upgrades campaign draft recovery from tab-only storage to a durable IndexedDB-backed local workspace while preserving the 0.18.5 backend/delivery contract.

### Added
- IndexedDB-backed campaign drafts scoped by account + workspace.
- Durable parsed CSV/XLSX recipient data and message draft recovery after tab/browser closure.
- Cached prepared personalization rows so an already-prepared message can remain editable offline.
- Local draft save status and last-save timestamp.
- Offline draft mode messaging with explicit network-action boundaries.
- Reconnect refresh of prepared recipient personalization rows without overwriting local message edits.
- Persistent-draft cleanup on discard, successful campaign cleanup paths, and sign-out.
- 0.18.10 storage/workspace tests and source contract.

### Safety rules preserved
- Offline draft mode is **not** offline sending.
- Unprepared consent confirmation is not persisted; it must be reconfirmed after draft recovery.
- Recipient preparation, server draft save/review, confirmation, authorization, queueing and recovery remain network-only.
- Service worker still ignores non-GET requests and does not use Background Sync.
- Exact-SIM binding, UNKNOWN/no-resend, callback evidence and durable queue semantics are unchanged.
- No Supabase migration, RLS/RPC or Android change.

Backend contract remains `0.18.5`.
