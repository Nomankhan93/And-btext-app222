# Validation — Web 0.18.10-a1

## Artifact-environment results

- `node scripts/test-phone-sim-mobile01810a1-source.mjs`: **PASS — 28 assertions**.
- Preserved 0.18.7-r2 mobile-navigation source contract: **PASS — 23 assertions**.
- Preserved 0.18.8 PWA source contract: **PASS — 32 assertions**.
- Preserved 0.18.9 landing/brand source contract: **PASS — 32 assertions**.
- Preserved 0.18.10 offline-draft source contract: **PASS — 34 assertions**.
- `node scripts/preflight.mjs`: **PASS — Web 0.18.10-a1 / backend 0.18.5**.
- Release path scan: **PASS**.
- Release secret-value scan: **PASS**.
- ZIP path scan: **PASS**.
- ZIP secret-value scan: **PASS**.
- Deterministic release SHA manifest verification: **PASS**.
- Protected runtime scope review: only `DevicesPage.tsx` presentation classes and scoped `app.css` responsive rules changed; pairing/RPC/SIM/send/delivery logic is unchanged.

`npm ci` was attempted twice in the isolated artifact container, but the package transport timed out before a complete dependency tree was installed. Therefore the real Vitest suite, TypeScript semantic check and Vite production build must still be run in the normal WSL checkout before commit/deploy.

The uploaded 0.18.10 audit ZIP omitted `.env.example`; `0.18.10-a1` restores a placeholder-only template so project preflight can run. This does not alter runtime configuration.

## Required WSL release gates

```bash
npm ci &&
npm run test:phone-sim-mobile-source-01810a1 &&
npm run test:mobile-ui-source-0187 &&
npm run test:mobile-ui-0187 &&
npm run check &&
npm run test &&
npm run build &&
git diff --check &&
git status
```

## Manual mobile acceptance after deploy
- 320 px: no page-level horizontal scroll.
- 360 px: no page-level horizontal scroll.
- 390 px: no page-level horizontal scroll.
- 430 px: no page-level horizontal scroll.
- QR remains centered and fully visible.
- Pairing code remains readable without widening the page.
- Pairing buttons stay inside the panel and remain usable.
- Connected-device/SIM cards wrap long values safely.
- Recent-pairing history scrolls only inside its own table wrapper when needed.
- Bottom navigation remains unchanged.

No Supabase migration, backend contract, delivery workflow, service-worker behavior or Android behavior is changed by this patch.
