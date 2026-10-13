# Handoff — Web 0.19.6-r1

Release: **Initial Bootstrap Chunk Correction**

Frontend version: `0.19.6-r1`
Backend contract: `0.18.5`

## Corrective contract

- `src/main.tsx` no longer statically imports the application route tree or auth/workspace providers.
- `src/AppBootstrap.tsx` preserves the exact `AuthProvider → WorkspaceProvider → App` composition and is loaded through `React.lazy()`.
- `PwaProvider` and `BrowserRouter` remain in the initial entry.
- The original 0.19.6 route-level lazy chunks remain unchanged.
- The public landing remains eager inside the application route tree.
- `/asset-manifest.json` still drives installed-PWA build-asset precaching, including the new bootstrap chunk.
- Service-worker cache identity is `0.19.6-r1`.
- The bundle regression still enforces `< 500 KiB` initial static JS and now uses `< 500,000 bytes` for every emitted JS chunk so the Vite large-chunk warning cannot be accepted.

## Reason

The first 0.19.6 WSL build passed all functional gates and reduced the main bundle from ~744.57 kB to 532.40 kB, but `npm run test:bundle-0196` correctly failed at `532403 > 512000` bytes.

## Non-scope

No database, RLS/RPC, Android, gateway/SIM, campaign/send, delivery-state, auth/workspace authorization, offline-draft data-model or UI-design behavior changes.
