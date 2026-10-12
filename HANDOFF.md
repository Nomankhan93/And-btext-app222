# BulkText handoff — Web 0.18.8

Current frontend release is Web `0.18.8`, built over `0.18.7-r2`.

This release adds:
- installable PWA manifest, app icons, favicons and Apple touch icon;
- production-only service-worker registration;
- cached app shell plus hashed Vite JS/CSS/static assets for offline reopening;
- global offline and controlled update notices;
- browser-driven Install BulkText UX on Dashboard/Settings;
- offline blocking for campaign confirmation, Send to Android, send authorization, durable queue creation, recovery, Phone & SIM mutations and profile save;
- explicit reconnect state when an authenticated workspace cannot be loaded offline.

Safety boundary: Supabase/auth/API data, exact-SIM status, queue/delivery state, callbacks and mutations are never cached or replayed by the service worker. There is no offline send queue or Background Sync.

Backend contract remains `0.18.5`. No Supabase migration or Android change is included.

Read `PATCH_0_18_8_README.md`, `VALIDATION_0_18_8.md` and `CHANGED_FILES_0_18_8.txt` before applying/committing.
