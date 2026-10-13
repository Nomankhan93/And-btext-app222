# Production Observability & Error Diagnostics — Web 0.19.7

Web `0.19.7` adds a first-party client diagnostic boundary without adding a remote telemetry vendor or backend endpoint.

## Diagnostic capture

BulkText now captures these client failure classes:

- handled operational failures passing through `errorMessage()` when they are network, authentication, permission, internal/server or unknown failures;
- top-level React render failures;
- lazy route load/render failures;
- browser `error` events;
- unhandled promise rejections.

Expected user/domain validation messages are not recorded as operational failures.

## Privacy boundary

Diagnostic events do **not** persist raw backend `message`, `details` or `hint` values. They also do not persist phone numbers, recipient/contact data, user email, auth tokens, full URLs, query strings, campaign/workspace IDs or arbitrary route parameters.

Stored event fields are limited to:

- release and runtime environment;
- timestamp and local diagnostic ID;
- source/category/severity;
- constrained error name/code/status tokens;
- a coarse route group such as `campaigns`, `imports`, `devices` or `settings`;
- online/offline state;
- a fingerprint composed only from those sanitized fields.

Only the latest 25 events are retained in `sessionStorage`, so diagnostics are scoped to the current browser tab session.

## Support access

Settings includes a **Technical diagnostics** panel showing the current event count. Users can copy a sanitized JSON snapshot for support or clear the current session diagnostics.

## Safety behavior

Diagnostic storage, subscribers and browser diagnostic event dispatch are best-effort. Observability failures must not interrupt BulkText workflows.

## Non-scope

No Supabase migration, RLS/RPC change, remote telemetry backend, analytics vendor, campaign/send workflow change, Android/gateway/SIM behavior change, offline draft model change, PWA fetch-strategy change, route-loading architecture change or bundle-budget relaxation is included.
