# Web 0.19.6-r1 — Initial Bootstrap Chunk Correction

## Reason for correction

Web `0.19.6` successfully introduced route-level code splitting and reduced the previous ~744.57 kB main JavaScript bundle to 532.40 kB, but the authoritative post-build gate failed because initial static JavaScript was `532403` bytes against a `512000`-byte budget. Vite also continued to emit its >500 kB chunk warning.

`0.19.6-r1` fixes the remaining dependency graph instead of increasing the threshold.

## Scope

- Adds `src/AppBootstrap.tsx` as the owner of the unchanged `AuthProvider → WorkspaceProvider → App` tree.
- Changes `src/main.tsx` to load `AppBootstrap` with `React.lazy()` behind a visible Suspense status fallback.
- Keeps `PwaProvider`, `BrowserRouter`, global CSS and the root mount in the initial entry.
- Preserves all route-level lazy imports from `0.19.6`.
- Preserves the public `LandingPage` as an eager import inside the loaded route tree.
- Keeps the asset-manifest service-worker precache so the bootstrap and route chunks remain available to the installed PWA shell.
- Bumps the frontend/service-worker release identity to `0.19.6-r1`.
- Adds a corrective source contract and strengthens the post-build gate.

## Bundle gates

The release must prove after `npm run build` that:

- `src/AppBootstrap.tsx` is emitted as a Vite dynamic entry;
- the bootstrap chunk is not reachable through the initial static dependency graph;
- there are at least 11 dynamic entries;
- total initial static JavaScript is `< 500 KiB`;
- every emitted JavaScript chunk is `< 500,000 bytes`.

The threshold is intentionally not relaxed.

## Explicit non-scope

No migration, RLS/RPC, Android, gateway, SIM, campaign/send workflow, delivery state machine, auth/workspace authorization, offline-draft data model, service-worker fetch-strategy or visual-design change.

Frontend: `0.19.6-r1`
Backend contract: `0.18.5`

## Required validation

```bash
npm run test:bootstrap-split-source-0196r1
npm run preflight
npm run test:bootstrap-split-0196r1
npm run check
npm run test
npm run build
npm run test:bundle-0196
git diff --check
./scripts/release-package.sh
git status
```
