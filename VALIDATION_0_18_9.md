# Validation — Web 0.18.9

## Completed during patch build

- `node scripts/test-landing-brand0189-source.mjs`: PASS — 32 source-contract assertions.
- `node scripts/test-pwa0188-source.mjs`: PASS — 32 preserved PWA-contract assertions.
- `node scripts/test-mobile-ui0187-source.mjs`: PASS — 23 preserved mobile-navigation assertions.
- `node scripts/preflight.mjs`: PASS — Web `0.18.9`, backend contract `0.18.5`.
- TS/TSX parser check: PASS — 95 source/test TypeScript files.
- `node --check public/service-worker.js`: PASS.
- `node --check scripts/test-landing-brand0189-source.mjs`: PASS.
- manifest/package JSON parse: PASS.
- CSS brace/structure guard: PASS.
- guarded diff inspection: 32 changed/new files, limited to public/auth/branding/PWA-cache-version/tests/release metadata.
- `supabase/**`, delivery/recovery logic, campaign draft storage, live-status hooks and queue/auth backend contracts remain unchanged.
- changed-file whitespace/conflict guard: PASS.
- release source path scan: PASS.
- release source secret-value scan: PASS.
- full source ZIP path/secret scan: PASS.
- overlay patch ZIP integrity: PASS.
- overlay patch path/secret scan: PASS.
- overlay apply simulation onto clean `0.18.8`: PASS.
- applied-overlay SHA256 manifest verification: PASS.

## Environment limitation

The isolated artifact environment cannot complete `npm ci --offline` because its npm cache is missing registry tarballs (`yallist@3.1.1`, followed by `xmlchars@2.2.0`). This is an environment/cache limitation, not a reported application test failure.

Run the authoritative WSL validation after applying the patch:

```bash
npm ci &&
npm run test:landing-source-0189 &&
npm run test:landing-0189 &&
npm run test:pwa-source-0188 &&
npm run test:pwa-0188 &&
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

Expected new source-contract line:

```text
Web 0.18.9 landing + brand source contract: PASS (32 assertions)
```

## Browser acceptance after deploy

1. Signed-out `/` shows the public landing page; signed-in `/` redirects to `/dashboard`.
2. Public header contains Features / How it works / Why BulkText / FAQ / Sign in / Get Started and contains no Pricing link.
3. No `Start Free` wording appears.
4. Official BulkText app icon/wordmark appears in the authenticated top bar.
5. Desktop auth uses the horizontal official logo; mobile auth uses the official app icon.
6. Login/signup/forgot/reset/verify flows behave exactly as before.
7. 360/390/412/768px plus desktop have no page-level horizontal overflow.
8. Existing mobile Home / Campaigns / Phone & SIM / Tools bottom navigation remains intact.
9. Existing PWA install prompt, offline banner and controlled update flow remain intact.
10. Activating the `0.18.9` service worker clears prior `bulktext-pwa-*` caches and loads the branded shell/logo.
11. Auth/API/send/queue/callback traffic is still never cached or replayed by the service worker.
12. Authenticated campaign/send/delivery workflows remain visually and behaviorally unchanged apart from primary branding tokens/header logo.

## Database

No migration is included. Do **not** run `supabase db push` for Web 0.18.9.
