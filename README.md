# Web 0.19.2 — Installed PWA Vertical Scrolling Fix

BulkText Web `0.19.2` fixes the installed PWA/mobile condition where navigation taps still worked but the page itself could stop responding to vertical swipe scrolling. The document/root scroll contract is explicit in normal and standalone display modes, while the fixed mobile bottom navigation and independently scrollable Tools sheet are preserved.

Frontend version is `0.19.2`; backend contract remains `0.18.5`. There is no Supabase migration, RLS/RPC change, delivery state-machine change, Android change, SIM-selection change, campaign behavior change, auth/routing change or offline-draft behavior change.

See `PATCH_0_19_2_README.md`, `HANDOFF_0_19_2.md` and `VALIDATION_0_19_2.md` for this release.
