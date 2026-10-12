# Validation — Web 0.18.7-r2

## Packaging-environment validation

Completed successfully:

- `node scripts/test-mobile-ui0187-source.mjs` — PASS, 23 assertions.
- TS/TSX syntax parse — PASS across 88 source/test files.
- AppShell, navigation library and r2 test transpile — PASS.
- CSS structural balance — PASS.
- Guarded r2 diff — PASS, 17 changed/new files only.
- Protected `supabase/**`, draft-storage, live-status, exact-SIM, durable-queue, delivery and recovery files — unchanged.
- `sha256sum -c SHA256SUMS.txt` — PASS for all 178 manifest entries.

## npm validation note

The isolated packaging container cannot complete the authoritative npm suite because external registry access is unavailable and its npm cache is incomplete. This is an environment limitation, not an observed code/test failure.

The immediately preceding Web 0.18.7 baseline was fully validated in the user's WSL checkout before this navigation-only refinement with:

- targeted mobile/reliability suite: 34/34 tests PASS;
- full frontend suite: 126/126 tests PASS;
- TypeScript: PASS;
- production build: PASS;
- delivery contract: 39/39 scenarios PASS;
- checksum verification and `git diff --check`: PASS.

## Authoritative local validation after apply

Run in the project WSL checkout:

```bash
npm ci &&
npm run test:mobile-ui-source-0187 &&
npm run test:mobile-ui-0187 &&
npm run check &&
npm run test &&
npm run build &&
npm run test:delivery-contract &&
sha256sum -c SHA256SUMS.txt &&
git diff --check &&
git status
```

Expected r2-specific results include:

- source contract: 23 assertions PASS;
- mobile navigation tests covering Home/Campaigns/Phone & SIM/Tools, expandable Tools sheet, Escape dismissal, and secondary-route active state;
- no database migration or hosted Supabase operation.
