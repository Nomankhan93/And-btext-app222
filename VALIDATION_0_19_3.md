# Validation — Web 0.19.3

## Artifact-environment results

- `node scripts/test-release-artifact0193-source.mjs`: **PASS — 25 assertions**.
- Preserved source/PWA contracts: **PASS — 253 assertions** across 0.18.7-r2, 0.18.8, 0.18.9, 0.18.10, 0.18.10-a1, 0.18.10-r1, 0.19.1 and 0.19.2 source/shell checks.
- `node scripts/preflight.mjs`: **PASS — Web 0.19.3 / backend 0.18.5**.
- Release source preflight: **PASS**.
- Release staged-source preflight: **PASS**.
- Release path scan: **PASS**.
- Release secret-value scan: **PASS**.
- ZIP path scan: **PASS**.
- ZIP secret-value scan: **PASS**.
- Version-derived ZIP root verification: **PASS — `bulktext-web-0.19.3/`**.
- Extracted ZIP SHA256 manifest verification: **PASS**.
- Extracted ZIP preflight: **PASS**.
- Custom `--stage-dir` regression: **PASS — ZIP root remains `bulktext-web-0.19.3/`**.
- `.patch-backups/` and `supabase/config.toml.before-*` are absent from the generated release artifact.

The isolated artifact container could not complete `npm ci`; package transport stalled before a complete dependency tree was installed. The partial install left Vitest/type packages unavailable, so Vitest, TypeScript semantic checking and Vite production build are **not certified from that container**. Run the required WSL gates below with the project-pinned Node `24.21.0` before commit/deploy.

## Release-integrity contract

- `.env.example` exists and contains placeholder-only public browser variables.
- Package and lockfile frontend version are both `0.19.3`.
- Backend contract remains `0.18.5`.
- Source preflight passes before release staging.
- Staged-source preflight passes before checksum/ZIP generation.
- Release SHA256 manifest verifies before ZIP creation.
- ZIP layout is restricted to the version-derived `bulktext-web-0.19.3/` root even when a custom stage directory is supplied.
- Extracted ZIP SHA256 manifest verifies.
- Extracted ZIP preflight passes.
- Release and ZIP path/secret-value scans pass.
- `.patch-backups/` and `supabase/config.toml.before-*` are excluded from generated release artifacts.

## Required WSL certification

```bash
nvm use 24.21.0
npm ci
npm run test:release-artifact-source-0193
npm run preflight
npm run test:pwa-scroll-source-0192
npm run test:pwa-scroll-0192
npm run check
npm run test
npm run build
git diff --check
./scripts/release-package.sh
git status
```

The patch changes no database, campaign/send, gateway, SIM-selection, delivery-state, auth/workspace, routing or offline-draft behavior.
