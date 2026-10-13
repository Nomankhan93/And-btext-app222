# Handoff — Web 0.19.6

Release: **Bundle & Route Loading Optimization**

Frontend version: `0.19.6`
Backend contract: `0.18.5`

## Changed contract

- `src/App.tsx`: authenticated shell, auth pages and secondary/application pages use `React.lazy()` route chunks.
- `src/App.tsx`: public `LandingPage` stays eager so the signed-out root has no route-chunk dependency.
- `src/App.tsx`: shared Suspense loading state and `RouteLoadBoundary` provide visible loading and retry behavior for lazy chunk failures.
- `vite.config.ts`: emits `/asset-manifest.json` for deterministic build-asset discovery.
- `public/service-worker.js`: install-time shell precaching reads that manifest and includes lazy build chunks, preserving installed cold-start offline routes after code splitting.
- Runtime navigation remains network-first and static assets remain cache-first; non-static Supabase/auth/gateway traffic is unchanged.
- `scripts/test-route-loading0196-build.mjs`: enforces a 500 KiB initial static-JS budget, at least 10 dynamic route entries, and a 500 KiB per-JS-chunk ceiling.
- `src/test/routeLoading0196.test.tsx`: covers direct protected/auth deep links and recoverable lazy-chunk failure behavior.

## Non-scope

No migration, RLS/RPC, gateway, SIM, campaign/send workflow, delivery state machine, auth/workspace authorization, offline-draft data-model or visual redesign changes.
