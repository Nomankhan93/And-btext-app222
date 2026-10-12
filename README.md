# Web 0.19.4 — Mobile Dialog Focus Accessibility

BulkText Web `0.19.4` corrects keyboard focus behavior for the mobile Tools dialog. Opening Tools now moves focus into the dialog, `Tab` and `Shift+Tab` remain contained within it, and closing restores focus to the original Tools trigger while preserving Escape, backdrop and route-navigation behavior.

Frontend version is `0.19.4`; backend contract remains `0.18.5`. There is no Supabase migration, RLS/RPC change, Android change, SIM-selection change, campaign/send behavior change, delivery state-machine change, auth/workspace change, route-structure change, offline-draft behavior change or PWA fetch-strategy change. The service-worker change is limited to the `0.19.4` cache marker.

See `PATCH_0_19_4_README.md`, `HANDOFF_0_19_4.md` and `VALIDATION_0_19_4.md` for this release.
