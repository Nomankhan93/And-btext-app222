# Web 0.18.8 — PWA Installation, Service Worker & Offline Safety

BulkText Web `0.18.8` adds production PWA installability, branded app icons/favicons, a controlled service-worker update lifecycle, safe app-shell/static-asset caching and explicit offline UX on top of the `0.18.7-r2` mobile bottom-navigation release.

Frontend version is `0.18.8`; backend contract remains `0.18.5`. No database migration is included.

The service worker caches only the same-origin application shell and static assets. Supabase/auth, campaign confirmation, exact-SIM authorization, durable queue, callbacks, recovery and gateway requests are never cached or replayed. BulkText does **not** implement offline sending or Background Sync in this release.

See `PATCH_0_18_8_README.md`, `VALIDATION_0_18_8.md` and `HANDOFF_0_18_8.md`.
