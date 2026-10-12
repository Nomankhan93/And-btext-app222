# Validation — Web 0.19.5

## Artifact-environment results

- `node scripts/test-error-presentation0195-source.mjs`: **PASS — 29 assertions**.
- Preserved source/PWA contracts: **PASS — 301 assertions** across retained mobile, PWA, landing, offline, public-root, scroll, release-integrity and dialog-focus checks.
- Combined source-level contract coverage: **PASS — 330 assertions**.
- `node scripts/preflight.mjs`: **PASS — Web 0.19.5 / backend 0.18.5**.
- Source `SHA256SUMS.txt`: **PASS**.
- Release source preflight: **PASS**.
- Release staged-source preflight: **PASS**.
- Version-derived ZIP root verification: **PASS — `bulktext-web-0.19.5/`**.
- Extracted ZIP SHA256 manifest verification: **PASS**.
- Extracted ZIP preflight: **PASS**.
- Release and ZIP path scans: **PASS**.
- Release and ZIP secret-value scans: **PASS**.

The isolated artifact container could not complete `npm ci` within the package transport window, so Vitest, TypeScript semantic checking and Vite production build are not certified from that container. Run the WSL gates below with the project-pinned Node `24.21.0` before commit/deploy.

## Required WSL certification

```bash
nvm use 24.21.0
npm ci
npm run test:error-presentation-source-0195
npm run preflight
npm run test:error-presentation-0195
npm run check
npm run test
npm run build
git diff --check
./scripts/release-package.sh
git status
```

No database, gateway, SIM-selection, campaign/send, delivery-state, auth/workspace flow, routing, offline-draft or PWA fetch-strategy behavior is changed.
