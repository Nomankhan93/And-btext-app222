# Current Handoff — Web 0.19.7

Current frontend release: `0.19.7`
Backend contract: `0.18.5`

`0.19.7 — Production Observability & Error Diagnostics` adds first-party, privacy-safe client diagnostics without adding a telemetry vendor or backend endpoint.

BulkText now captures handled operational failures, top-level React render failures, lazy route failures, browser errors and unhandled promise rejections. The current-tab diagnostic buffer is capped at 25 sanitized events and deliberately excludes raw backend message/details/hint text, phone/contact data, user email, auth tokens, full URLs, query strings and route parameters.

Settings includes a **Technical diagnostics** panel to copy a sanitized JSON support snapshot or clear recent events. Remaining auth/profile error presentation is routed through the shared safe error boundary.

The `0.19.6-r1` bootstrap/route split, installed-PWA asset-manifest precache and bundle budgets remain unchanged. No database, RLS/RPC, Android, gateway/SIM, campaign/send, delivery-state, auth/workspace authorization, offline-draft model or PWA fetch-strategy change is included.

See `HANDOFF_0_19_7.md`.
