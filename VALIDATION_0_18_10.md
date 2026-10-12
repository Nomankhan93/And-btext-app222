# Validation — Web 0.18.10

## Artifact-environment results

- `node scripts/test-offline-draft01810-source.mjs`: **PASS — 34 assertions**.
- Preserved 0.18.8 PWA source contract: **PASS — 32 assertions**.
- Preserved 0.18.7-r2 mobile-navigation source contract: **PASS — 23 assertions**.
- Preserved 0.18.9 landing/brand source contract: **PASS — 32 assertions**.
- `node scripts/preflight.mjs`: **PASS — Web 0.18.10 / backend 0.18.5**.
- TypeScript/TSX syntax transpile audit: **PASS — 96 files**.
- IndexedDB persistent-draft runtime smoke: **PASS**.
- Service-worker JavaScript syntax: **PASS**.
- CSS structural balance: **PASS**.
- Protected backend/send/delivery comparison: **PASS — 46/46 files unchanged**.
- Release path/secret scans and deterministic source ZIP: **PASS**.

`npm ci` could not complete in the isolated artifact environment because the npm install transport timed out and left an incomplete dependency tree. Therefore the real Vitest / TypeScript semantic check / Vite production build must be run in the normal WSL checkout before commit.

## Required WSL release gates

```bash
npm ci &&
npm run test:offline-draft-source-01810 &&
npm run test:offline-draft-01810 &&
npm run test:pwa-source-0188 &&
npm run test:pwa-0188 &&
npm run test:landing-source-0189 &&
npm run test:landing-0189 &&
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

## Safety assertions

- IndexedDB stores only browser-local draft/workspace data; it is not an SMS dispatch queue.
- No offline send, authorization, recovery or mutation replay path is added.
- Service worker still ignores non-GET requests and has no Background Sync handler.
- Unprepared consent confirmation is intentionally not restored; the user must reconfirm it after draft recovery.
- Local message edits remain local until the user explicitly chooses **Review campaign** while online.
- Prepared recipient details must refresh successfully after reconnect before Review becomes available.
- Persistent draft writes and cleanup are serialized so discard/sign-out cleanup cannot be overtaken by an older pending local write.
- No Supabase migration, RLS/RPC or Android change exists in this release.
