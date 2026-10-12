# Web 0.18.6 — Draft Reliability, Imports & Campaign UX

Baseline: supplied Web 0.18.5 source. Backend contract: 0.18.5. No new migration, reset, automatic deployment or Android change.

## Validate in WSL

```bash
cd /home/noman/projects/bulktext-web-0.4.0
nvm use &&
npm ci &&
npm run validate &&
npm run test:delivery-contract &&
node -p "require('./package.json').version" &&
sha256sum -c SHA256SUMS.txt
```

Expected frontend version: 0.18.6. The SQL contract test runs in isolated in-memory PGlite and does not contact hosted Supabase or require a local Supabase stack. Deploy through your usual Web workflow after checks pass. Do not run a database reset or create a version-only migration.

See docs/DRAFT_IMPORT_CAMPAIGN_UX_0186.md for behavior, privacy/storage limits and acceptance steps. New campaign recovery is scoped to this browser tab and account/workspace; signing out clears it. If storage is unavailable or the list is too large, the UI warns and browser unload warns. Already-issued server writes may finish after navigation; ambiguous failures are not an exactly-once guarantee.

The patch installer validates source/payload hashes, backs up changed originals, refuses modified/incompatible source, supports check-only/idempotent apply and rolls back caught write failures. It preserves .env, .env.example, git history and user data. Both documented 0.18.5 .env.example hash variants are supported, with the source checksum list adjusted to the preserved bytes. Never force-copy payload over a failed guard.
