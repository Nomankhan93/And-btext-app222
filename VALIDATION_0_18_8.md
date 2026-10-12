# Validation — Web 0.18.8

## Completed during patch build

- `node scripts/test-pwa0188-source.mjs`: PASS — 32 source-contract assertions.
- `node scripts/preflight.mjs`: PASS — Web `0.18.8`, backend contract `0.18.5`.
- TS/TSX syntax parse: PASS — 92 source/test/script TypeScript files at build-time check.
- `node --check public/service-worker.js`: PASS.
- JSON parse: PASS — package files and manifest.
- CSS brace/structure guard: PASS.
- Protected backend/reliability comparison: PASS — 54 guarded files unchanged.
- Release path scan: PASS.
- Release secret-value scan: PASS.
- Full source ZIP path/secret scan: PASS.
- Service-worker source confirms no Background Sync/offline send queue, no mutation caching, no cross-origin interception and no forced install-time `skipWaiting`.

## Environment limitation

The isolated artifact environment could not run `npm ci --offline`: its local npm cache lacks transitive registry tarballs (first observed `yallist@3.1.1`, then `xmlchars@2.2.0`). This is an environment/cache limitation, not a reported application test failure.

Run the following authoritative validation in the normal WSL project checkout after applying the patch:

```bash
npm ci &&
npm run test:pwa-source-0188 &&
npm run test:pwa-0188 &&
npm run check &&
npm run test &&
npm run build &&
npm run test:delivery-contract &&
sha256sum -c SHA256SUMS.txt &&
git diff --check &&
git status
```

Expected source-contract line:

```text
Web 0.18.8 PWA source contract: PASS (32 assertions)
```

## Browser acceptance after deploy

Validate on the deployed HTTPS site:
1. manifest/icons recognized and BulkText is installable where browser support allows;
2. installed app opens in standalone mode;
3. mobile Home / Campaigns / Phone & SIM / Tools bottom nav remains correct;
4. visit once online, then disable network and hard-reopen: cached app shell/static assets load;
5. offline banner is visible and live/send actions are disabled;
6. campaign draft text survives tab switch and service-worker update reload;
7. cached/offline UI never represents Phone/SIM, queue, SENT or DELIVERED state as freshly updated;
8. reconnect restores network-backed workflows without a forced form reset;
9. deploy a newer frontend and confirm update is user-controlled (`Reload & update`) rather than automatic;
10. Chrome/Edge Application panel shows old `bulktext-pwa-*` caches removed after new worker activation.

## Database

No migration is included. Do **not** run `supabase db push` for Web 0.18.8.
