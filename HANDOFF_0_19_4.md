# Handoff — Web 0.19.4

Release: **Mobile Dialog Focus Accessibility**

Frontend version: `0.19.4`
Backend contract: `0.18.5`
Database migration: **none**

## Implementation

- `src/components/AppShell.tsx`: adds stable dialog/trigger refs, initial focus, keyboard focus wrapping and safe focus restoration for the mobile Tools dialog.
- The existing Tools backdrop remains pointer-dismissible but is removed from sequential keyboard focus with `tabIndex={-1}`.
- Existing Escape close, route close, active Tools state, navigation links and modal ARIA semantics remain intact.
- `src/test/mobileDialogFocus0194.test.tsx`: verifies initial focus, forward/reverse wrap, Escape restoration, close-button restoration, backdrop dismissal and route navigation.
- `scripts/test-mobile-dialog-focus0194-source.mjs`: guards the 0.19.4 accessibility contract and no-migration boundary.
- `scripts/preflight.mjs`: requires the new regression artifacts and guards the focus-management markers.
- `public/service-worker.js`: cache marker only is bumped to `0.19.4`; fetch/cache strategy is unchanged.

## Required WSL validation

Use Node `24.21.0`:

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

Do not run `supabase db push`; this release has no database migration.
