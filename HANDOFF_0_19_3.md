# Handoff — Web 0.19.3

Release: **Release Artifact Integrity & Validation**

Frontend version: `0.19.3`  
Backend contract: `0.18.5`  
Database migration: **none**

## Implementation

- `.env.example`: restored with public placeholder values only.
- `scripts/preflight.mjs`: requires and validates the environment template, release-integrity source test and 0.19.3 package metadata.
- `scripts/release-package.py`: now preflights source + stage + extracted ZIP, verifies extracted checksums and enforces the version-derived ZIP root.
- `scripts/test-release-artifact0193-source.mjs`: narrow release-integrity regression contract.
- `SHA256SUMS.txt`: regenerated from the corrected clean source set.
- Historical source-contract scripts only receive current release/cache marker updates; their feature assertions are otherwise unchanged.
- `public/service-worker.js`: cache marker only is bumped to `0.19.3`; fetch/cache strategy is unchanged.

## Required WSL validation

Use Node `24.21.0`:

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

Do not run `supabase db push`; this release has no database migration.
