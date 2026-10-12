# Validation — Web 0.18.7 Mobile UI/UX

Baseline: Web `0.18.6-r2`  
Frontend: `0.18.7`  
Backend contract: `0.18.5`  
Database migration: **none**

## Completed in the isolated patch builder

- PASS — Web 0.18.7 source contract: 20 assertions.
- PASS — TypeScript parser audit: 88 TS/TSX source/test files parsed with zero syntax errors.
- PASS — CSS structural audit: balanced braces.
- PASS — guarded diff: `supabase/**` unchanged.
- PASS — guarded diff: `campaignDraftStorage.ts` unchanged.
- PASS — guarded diff: `useGatewayLiveStatus.ts` unchanged.
- PASS — guarded diff: `useCampaignLiveStatus.ts` unchanged.
- PASS — guarded diff: gateway preflight/authorization APIs unchanged.
- PASS — guarded diff: durable queue APIs/semantics unchanged.
- PASS — guarded diff: delivery contract/recovery logic unchanged.
- PASS — baseline-to-patch `git diff --check` equivalent in a temporary Git audit checkout.
- PASS — deterministic release path scan.
- PASS — deterministic release secret-value scan.
- PASS — generated ZIP path scan.
- PASS — generated ZIP secret-value scan.

## Environment limitation

The isolated builder has no DNS access to the npm registry and its local npm cache is incomplete (`yallist@3.1.1`, then `xmlchars@2.2.0` were missing). Therefore dependency installation could not complete here, so the following must be run in the normal WSL checkout before commit/deploy:

```bash
npm ci
npm run test:mobile-ui-source-0187
npm run test:mobile-ui-0187
npm run check
npm run test
npm run build
npm run test:delivery-contract
git diff --check
```

Do not run a database reset or create a version-only migration. Full PWA/offline validation is out of scope for 0.18.7.

## Manual browser acceptance after local build/deploy

Verify at 360, 390, 412 and 768px plus desktop:

- no page-level horizontal overflow;
- mobile drawer opens/closes, reports expanded state and retains all destinations;
- Campaign name → CSV/XLSX import → consent → message → review → confirm is usable with the mobile keyboard;
- switching to WhatsApp/another tab and returning does not clear the current same-tab campaign draft;
- failed replacement import preserves the previous valid import/consent state as defined by the existing reliability contract;
- Phone & SIM live status keeps updating without disturbing focused inputs;
- campaign queue/delivery status refreshes without a full page reload;
- Downloaded/ACKed is not labelled SENT or DELIVERED;
- exact SIM, consent/suppression and UNKNOWN/no-resend rules remain unchanged.
