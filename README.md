# Web 0.19.1 — Public Landing Root Routing Fix

BulkText Web `0.19.1` starts the 0.19.x frontend improvement phase with a narrow root-routing correction. The public landing page and branded auth experience built in 0.18.9 are preserved, while `/` now has one unambiguous owner: `PublicHomeRoute`. Signed-out visitors receive the public landing page and signed-in visitors are redirected to `/dashboard`.

Frontend version is `0.19.1`; backend contract remains `0.18.5`. There is no Supabase migration, RLS/RPC change, delivery state-machine change, Android change, SIM-selection change or offline-draft behavior change.

See `PATCH_0_19_1_README.md`, `HANDOFF_0_19_1.md` and `VALIDATION_0_19_1.md` for this release.
