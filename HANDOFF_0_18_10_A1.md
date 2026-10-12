# Handoff — Web 0.18.10-a1

Release: **Phone & SIM Mobile Responsive Correction**

Frontend version: `0.18.10-a1`
Backend contract: `0.18.5`
Database migration: **none**

## Implementation
- `src/pages/DevicesPage.tsx`: adds page/table scope classes only; device/pairing behavior is unchanged.
- `src/styles/app.css`: adds Phone & SIM-specific containment, responsive QR/code sizing and mobile wrapping.
- `scripts/test-phone-sim-mobile01810a1-source.mjs`: narrow source regression contract.
- Release metadata updated for the `0.18.10-a1` prerelease identifier.

## WSL validation

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

Then deploy and verify `Phone & SIM` in the mobile browser at 320, 360, 390 and 430 px widths. The full page must not scroll horizontally. The pairing-history table may scroll horizontally inside its own container.

Do not run `supabase db push`; this release has no database change.

Next planned corrective release remains **`0.18.10-r1 — Offline Draft & PWA Reliability`**.
