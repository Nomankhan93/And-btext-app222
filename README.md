# Web 0.19.8 — Auth, Session & Workspace Boundary Hardening

BulkText Web `0.19.8` hardens authentication/session recovery and workspace authorization boundaries on top of the `0.19.6-r1` lazy/bootstrap architecture and `0.19.7` privacy-safe diagnostics.

The browser now revalidates mounted sessions on reconnect/focus/visibility, rejects stale identity/workspace responses, clears account-scoped browser state across invalidation/account switches, sanitizes protected post-login return targets, and removes verified workspace authority immediately when the server reports authentication/permission loss.

Frontend version is `0.19.8`; backend contract remains `0.18.5`. No database migration is included.

See `PATCH_0_19_8_README.md`, `HANDOFF_0_19_8.md`, `VALIDATION_0_19_8.md` and `docs/AUTH_SESSION_WORKSPACE_BOUNDARY_0198.md`.
