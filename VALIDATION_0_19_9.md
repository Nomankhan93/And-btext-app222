# Validation — Web 0.19.9

## Required WSL certification

Run on Node `24.21.0`:

```bash
npm ci
npm run test:accessibility-forms-source-0199
npm run preflight
npm run test:accessibility-forms-0199
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

Acceptance requires the new form semantics regressions to pass while all retained auth/session, observability, PWA/offline and `0.19.6-r1` bundle-budget guards remain green.
