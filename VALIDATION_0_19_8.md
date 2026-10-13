# Validation — Web 0.19.8

## Required WSL certification

Run on Node `24.21.0`:

```bash
npm ci
npm run test:auth-boundary-source-0198
npm run preflight
npm run test:auth-boundary-0198
npm run test:observability-0197
npm run test:bootstrap-split-0196r1
npm run check
npm run test
npm run build
npm run test:bundle-0196
git diff --check
./scripts/release-package.sh
git status
```

Acceptance requires session-expiry, network-preservation, safe-return-target and workspace-permission regressions to pass while the existing `0.19.6-r1` bundle budget remains green.
