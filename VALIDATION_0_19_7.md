# Validation — Web 0.19.7

## Artifact/source validation

Artifact/source validation completed: **44/44** observability assertions PASS. All retained source/PWA contracts also PASS for **440 combined assertions**, including the service-worker shell harness and the `0.19.6-r1` bootstrap/route-loading guards. Project preflight reports `BulkText Web 0.19.7 / backend 0.18.5 preflight PASS`.

Required final WSL certification on Node `24.21.0`:

```bash
npm ci
npm run test:observability-source-0197
npm run preflight
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

Acceptance requires the existing `0.19.6-r1` bundle gate to remain green; observability is not allowed to regress the initial/bootstrap chunk budgets.
