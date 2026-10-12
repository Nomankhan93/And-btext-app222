# Web 0.19.2 — Installed PWA Vertical Scrolling Fix

## Scope

This is a narrow frontend/PWA correction on top of Web `0.19.1`.

- Removes the standalone-only `body { overscroll-behavior-y: none; }` restriction that was unique to installed-PWA display mode.
- Establishes explicit `html` / `body` vertical overflow and root minimum-height behavior so the document remains the vertical scroll container.
- Uses `100dvh` minimum height in standalone mode without locking the document to a fixed viewport height.
- Preserves the fixed mobile bottom navigation and safe-area bottom content padding.
- Preserves the Tools sheet's own bounded `overflow-y: auto` scrolling.
- Bumps the service-worker cache version to `0.19.2` so installed clients can receive the corrected CSS after update activation.
- Adds regression coverage for the installed-PWA scroll contract.

## Explicit non-scope

No route/auth redesign, database migration, Supabase/RLS/RPC change, Android change, SIM-selection change, campaign/send behavior change, delivery contract change, offline-draft behavior change or service-worker fetch-strategy redesign.

Frontend: `0.19.2`
Backend contract: `0.18.5`
