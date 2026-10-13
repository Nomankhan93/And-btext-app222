# Validation — Web 0.19.6

## Artifact-environment results

- `node scripts/test-route-loading0196-source.mjs`: **PASS — 34 assertions**.
- Preserved source/PWA contracts: **PASS — 332 assertions** across retained mobile, PWA, landing, offline, public-root, scroll, release-integrity, dialog-focus and safe-error checks.
- Combined source-level contract coverage: **PASS — 366 assertions**.
- `node scripts/test-pwa-shell01810r1.mjs`: **PASS — 10 assertions**, including manifest-discovered lazy route chunk precaching.
- `node scripts/preflight.mjs`: **PASS — Web 0.19.6 / backend 0.18.5**.
- Release source preflight: **PASS**.
- Release staged-source preflight: **PASS**.
- Version-derived ZIP root verification: **PASS — `bulktext-web-0.19.6/`**.
- Extracted ZIP SHA256 manifest verification: **PASS**.
- Extracted ZIP preflight: **PASS**.
- Release and ZIP path scans: **PASS**.
- Release and ZIP secret-value scans: **PASS**.

The isolated artifact container did not complete dependency installation within its package transport window, so Vitest, TypeScript semantic checking, Vite build output and the post-build 500 KiB bundle budget require WSL certification with project-pinned Node `24.21.0` before commit/deploy.

## Required WSL certification

```bash
nvm use 24.21.0
npm ci
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

No database, gateway, SIM-selection, campaign/send, delivery-state, auth/workspace authorization, offline-draft data-model or visual-design behavior is changed.
