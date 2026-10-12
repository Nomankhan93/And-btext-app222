# Validation — Web 0.18.10-r1

## Artifact-environment results

The following checks were executed against the release source in the isolated build environment:

- `node scripts/preflight.mjs`: **PASS — Web 0.18.10-r1 / backend 0.18.5**.
- `node scripts/test-offline-reliability01810r1-source.mjs`: **PASS — 56 assertions**.
- `node scripts/test-pwa-shell01810r1.mjs`: **PASS — 8 assertions**.
- Preserved 0.18.10 offline-draft source contract: **PASS — 34 assertions**.
- Preserved 0.18.8 PWA source contract: **PASS — 32 assertions**.
- Preserved 0.18.9 landing/brand source contract: **PASS — 32 assertions**.
- Preserved 0.18.7-r2 mobile-navigation source contract: **PASS — 23 assertions**.
- Preserved 0.18.10-a1 Phone & SIM source contract: **PASS — 28 assertions**.

The r1 source contract checks revision/CAS protection, transaction-complete semantics, explicit conflict handling, hydration gating, StrictMode symmetry, awaited discard, account-scoped offline workspace location, local-vs-server authority separation and the preserved a1 mobile correction. The service-worker functional harness reproduces failed required-asset installation and verifies that a successful installed shell is not replaced by later navigation HTML.

`npm ci --offline --ignore-scripts` cannot complete in this isolated container because the npm cache is missing package tarballs. Therefore Vitest, the TypeScript semantic check and the Vite production build must be run in the normal WSL checkout before commit/deploy. This document does not claim those gates passed in the isolated container.

## Required WSL release gates

```bash
npm ci && \
npm run preflight && \
npm run test:offline-reliability-source-01810r1 && \
npm run test:pwa-shell-01810r1 && \
npm run test:offline-draft-source-01810 && \
npm run test:pwa-source-0188 && \
npm run test:landing-source-0189 && \
npm run test:mobile-ui-source-0187 && \
npm run test:phone-sim-mobile-source-01810a1 && \
npm run test:offline-reliability-01810r1 && \
npm run check && \
npm run test && \
npm run build && \
git diff --check
```

## Browser acceptance after deploy

1. **Multi-tab conflict:** save revision A in one tab, advance it in a second tab, then edit/reload the stale tab. The stale copy must show a conflict and must not overwrite the newer saved version automatically.
2. **Discard/reopen:** discard a draft and immediately reopen `/campaigns/new`; the deleted draft must not reappear.
3. **Offline cold start:** after one successful server-verified session and local draft save, close the PWA/browser, start offline and reopen the campaign draft. Local editing should work; preparation/review/send must remain blocked until server verification succeeds.
4. **Account isolation:** another signed-in account must not see the first account’s cached workspace locator or draft.
5. **PWA failed asset:** a deployment/install where a required hashed JS/CSS asset is unavailable must reject the new worker rather than install an incomplete offline shell.
6. **PWA generation match:** after a successful install, offline navigation must use the installed shell with its matching cached hashed assets.
7. **Phone & SIM regression:** confirm the 0.18.10-a1 320/360/390/430 px containment remains correct.

## Non-required gates for this web-only patch

No new Supabase migration is present, so a hosted database push is not required. No Android source changed, so Android build/physical-device certification is outside this patch. Existing delivery-contract behavior must remain unchanged.
