# Web 0.19.1 — Public Landing Root Routing Fix

## Scope

This is a narrow frontend routing correction on top of Web `0.18.10-r1`.

- Signed-out `/` now resolves to the existing public `LandingPage` instead of being captured by the protected shell index.
- Signed-in `/` still redirects to `/dashboard` through `PublicHomeRoute`.
- Protected routes continue to redirect signed-out users to `/auth/login` with the exact encoded `returnTo` path/query.
- Direct auth routes and the existing 0.18.9 landing/auth visual system are unchanged.
- Added App-level routing regressions so the landing page is tested through the real route tree rather than only by rendering `LandingPage` directly.

## Explicit non-scope

No database migration, Supabase/RLS/RPC change, Android change, SIM-selection change, campaign/send behavior change, delivery contract change, offline-draft behavior change or PWA reliability redesign.

Frontend: `0.19.1`
Backend contract: `0.18.5`
