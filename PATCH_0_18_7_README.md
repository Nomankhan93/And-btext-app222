# Web 0.18.7 — Mobile UI/UX

Baseline: Web `0.18.6-r2`.

## Scope

This patch makes the primary mobile-browser journey comfortable from campaign creation through tracking while retaining the existing desktop workflow.

- Mobile drawer navigation with explicit primary and secondary destinations.
- 44px minimum interactive targets and consistent visible keyboard focus.
- Dashboard now prioritizes the next useful action and exact Phone/SIM readiness.
- Campaign creation keeps its existing same-tab recovery/reliability logic but uses a compact progress strip, readable import summary and mobile-safe message controls.
- Campaign history uses cards on small screens and keeps the existing table on desktop.
- Campaign tracking clearly separates Queued, Downloaded/ACKed, SENT, DELIVERED, Failed and UNKNOWN. Downloaded/ACKed is never presented as delivery.
- Preflight, authorization and durable-queue diagnostics remain available under a Technical send details disclosure.
- Phone/SIM cards and controls are touch-safe and compact on narrow screens.
- Detailed/diagnostic tables remain horizontally scrollable inside their own containers rather than forcing page-level overflow.

## Reliability boundary

The patch intentionally does not change:

- `supabase/**`, schema, migrations, RLS or RPCs;
- `campaignDraftStorage.ts` and same-tab draft identity;
- `useGatewayLiveStatus.ts` or `useCampaignLiveStatus.ts` polling/refresh behavior;
- exact-SIM preflight, short-lived authorization or durable queue semantics;
- consent/suppression rules;
- UNKNOWN/no-automatic-resend delivery rules;
- Android application behavior;
- PWA/service worker/offline caching (planned for Web 0.18.8).

Frontend version: `0.18.7`  
Backend contract: `0.18.5`
