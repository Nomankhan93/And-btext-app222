# Validation — Web 0.19.6-r1

## Source/static validation completed

- `node scripts/test-bootstrap-split0196r1-source.mjs`: **PASS — 30 assertions**.
- Original route-loading source contract: **PASS — 34 assertions**.
- Service-worker shell integrity: **PASS — 10 assertions**.
- All retained source/PWA contracts executed in the artifact workspace: **PASS — 396 combined assertions**.
- `node scripts/preflight.mjs`: **PASS — Web 0.19.6-r1 / backend 0.18.5**.

## Baseline failure being corrected

The user WSL run for Web `0.19.6` passed:

- focused route-loading runtime tests: **3 files / 10 tests**;
- TypeScript check;
- full Vitest suite: **34 files / 164 tests**;
- Vite production build.

The build emitted `dist/assets/index-BLB2U3Xz.js` at **532.40 kB** (`532403` bytes), and `npm run test:bundle-0196` correctly failed because the initial static-JS budget is **512000 bytes**.

## r1 post-build gate

After applying r1 in the normal WSL checkout, run the required validation sequence. `npm run test:bundle-0196` must report PASS and must prove:

- `AppBootstrap` is a dynamic manifest entry;
- `AppBootstrap` is outside the initial static dependency graph;
- at least 11 dynamic entries exist;
- initial static JS `< 512000` bytes;
- largest emitted JS chunk `< 500000` bytes.

The isolated artifact environment could not complete dependency installation, so no corrected runtime bundle size is claimed here.
