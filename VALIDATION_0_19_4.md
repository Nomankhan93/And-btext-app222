# Validation — Web 0.19.4

## Artifact-environment results

- `node scripts/test-mobile-dialog-focus0194-source.mjs`: **PASS — 23 assertions**.
- Preserved source/PWA contracts: **PASS — 278 assertions** across the retained mobile, PWA, landing, offline, public-root, scroll and release-integrity source/shell checks.
- Combined source-level contract coverage: **PASS — 301 assertions**.
- `node scripts/preflight.mjs`: **PASS — Web 0.19.4 / backend 0.18.5**.
- Source `SHA256SUMS.txt`: **PASS**.
- Release source preflight: **PASS**.
- Release staged-source preflight: **PASS**.
- Version-derived ZIP root verification: **PASS — `bulktext-web-0.19.4/`**.
- Extracted ZIP SHA256 manifest verification: **PASS**.
- Extracted ZIP preflight: **PASS**.
- Release and ZIP path scans: **PASS**.
- Release and ZIP secret-value scans: **PASS**.

The isolated artifact container could not complete `npm ci` within the available package transport window, so Vitest, TypeScript semantic checking and Vite production build are not certified from that container. Run the WSL gates below with the project-pinned Node `24.21.0` before commit/deploy.

## Accessibility contract

The mobile Tools dialog must:

- receive focus when opened;
- retain keyboard focus while open by wrapping `Tab` and `Shift+Tab` at its boundaries;
- close with Escape without unmounting routed content;
- restore focus to the Tools trigger after Escape, close-button dismissal, backdrop dismissal and secondary-route navigation;
- keep the backdrop outside sequential keyboard focus;
- preserve native button/link semantics and the existing modal ARIA semantics.

## Required WSL certification

```bash
nvm use 24.21.0
npm ci
npm run test:mobile-dialog-focus-source-0194
npm run preflight
npm run test:mobile-dialog-focus-0194
npm run test:mobile-ui-0187
npm run check
npm run test
npm run build
git diff --check
./scripts/release-package.sh
git status
```

No database, gateway, SIM-selection, campaign/send, delivery-state, auth/workspace, routing structure, offline-draft or PWA fetch-strategy behavior is changed.
