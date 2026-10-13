# BulkText Web 0.19.8 — Auth, Session & Workspace Boundary Hardening

Frontend release: `0.19.8`  
Backend contract: `0.18.5`

This release hardens browser identity and workspace boundaries: server-side session revalidation on reconnect/focus/visibility, stale-response rejection, account-scoped cleanup, safe protected-route return targets, and immediate workspace-authority removal after authentication/permission loss.

No database migration is included. Campaign/send, gateway/SIM, offline draft semantics, PWA fetch strategy, 0.19.6-r1 route/bundle architecture and 0.19.7 privacy-safe diagnostic design remain intact.

See `docs/AUTH_SESSION_WORKSPACE_BOUNDARY_0198.md` and `VALIDATION_0_19_8.md`.
