# Handoff — Web 0.18.10

Release: **Advanced Offline Draft Workspace**

Frontend version: `0.18.10`
Backend contract: `0.18.5`
Database migration: **none**

## Key implementation
- `src/lib/campaignDraftStorage.ts`: session + IndexedDB draft layers and account/workspace-scoped cleanup.
- `src/pages/SimpleCampaignPage.tsx`: device-draft hydration, local save status, offline network gates and reconnect recipient reconciliation.
- `public/service-worker.js`: cache version advanced only; no mutation/background sync behavior added.
- `docs/OFFLINE_DRAFT_WORKSPACE_01810.md`: safety and storage contract.

## Certification
Run:

```bash
npm ci &&
npm run test:offline-draft-source-01810 &&
npm run test:offline-draft-01810 &&
npm run test:pwa-source-0188 &&
npm run test:pwa-0188 &&
npm run test:landing-source-0189 &&
npm run test:landing-0189 &&
npm run check &&
npm run test &&
npm run build &&
npm run test:delivery-contract &&
sha256sum -c SHA256SUMS.txt &&
git diff --check &&
git status
```

Do not run `supabase db push` for this release.
