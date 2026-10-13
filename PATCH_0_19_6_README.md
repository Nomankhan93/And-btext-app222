# Web 0.19.6 — Bundle & Route Loading Optimization

## Scope

This is a frontend performance-only release on top of Web `0.19.5`.

- Converts `AppShell`, auth pages and application/workflow pages to route-level `React.lazy()` imports.
- Keeps `LandingPage` eager for a fast, reliable public root.
- Adds one shared Suspense fallback using the existing `LoadingState` component.
- Adds a route chunk error boundary with a safe Retry action instead of a blank screen when a dynamic import fails.
- Emits `dist/asset-manifest.json` from Vite.
- Uses the build manifest during service-worker install so all lazy JavaScript/CSS/assets are validated and precached before the versioned offline shell is committed.
- Preserves the existing network-first navigation behavior and cache-first same-origin static-asset behavior.
- Adds source, Vitest and post-build bundle regressions.
- Enforces initial static JavaScript `< 500 KiB` and every emitted JavaScript chunk `< 500 KiB`.

## Explicit non-scope

No Supabase migration, RLS/RPC change, Android change, SIM-selection change, campaign/send behavior change, delivery-state change, auth/workspace authorization change, offline-draft data-model change or visual redesign.

Frontend: `0.19.6`
Backend contract: `0.18.5`

## Required validation

```bash
npm run test:route-loading-source-0196
npm run preflight
npm run test:route-loading-0196
npm run check
npm run test
npm run build
npm run test:bundle-0196
git diff --check
./scripts/release-package.sh
git status
```
