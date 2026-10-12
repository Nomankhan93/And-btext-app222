# Web 0.19.5 — Safe Error Presentation & Diagnostics

BulkText Web `0.19.5` separates user-facing failure copy from raw backend diagnostics. Network, authentication and permission failures now receive stable actionable messages; SQL/schema/RLS/PostgREST implementation details are no longer concatenated into normal UI errors; safe validation/domain messages remain available to users.

Raw `message`, `details`, `hint`, `code` and status values remain available through `errorDiagnosticContext()` for deliberate development diagnostics without being automatically surfaced by `errorMessage()`.

Frontend version is `0.19.5`; backend contract remains `0.18.5`. There is no Supabase migration, RLS/RPC change, Android change, SIM-selection change, campaign/send behavior change, delivery state-machine change, auth/workspace flow change, route-structure change, offline-draft behavior change or PWA fetch-strategy change. The service-worker change is limited to the `0.19.5` cache marker.

See `PATCH_0_19_5_README.md`, `HANDOFF_0_19_5.md` and `VALIDATION_0_19_5.md` for this release.
