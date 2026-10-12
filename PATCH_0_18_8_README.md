# Web 0.18.8 — PWA Installation, Service Worker & Offline Safety

## Baseline

Built on Web `0.18.7-r2 — Mobile Bottom Navigation Refinement`.

Frontend version: `0.18.8`
Backend contract: `0.18.5`
Database migration: **none**
Android change: **none**

## What is included

### PWA installability
- `manifest.webmanifest` with standalone launch behavior.
- BulkText 192px / 512px standard and maskable icons.
- favicon, 16px/32px PNG favicons and Apple touch icon.
- manifest/favicon/mobile-app metadata wired in `index.html`.
- Dashboard install card only when the browser exposes an install prompt.
- Settings PWA card with installed/installable/manual-install state.

### Service worker
- production-only registration;
- versioned shell/runtime caches;
- installation pre-caches the current built `index.html`, its hashed `/assets/*` JS/CSS references, offline fallback and install icons;
- same-origin static assets use cache-first runtime behavior;
- navigation uses network-first with cached SPA-shell fallback;
- old BulkText PWA caches are removed on activation;
- a waiting worker does **not** auto-activate or reload the page;
- update activation occurs only after the user chooses `Reload & update`.

### Offline UX and safety
- global `You’re offline` notice while the authenticated shell remains mounted;
- open local campaign draft editing remains available through the existing tab-draft persistence;
- campaign confirmation is disabled offline;
- Send to Android, preflight refresh, authorization, authorization revoke, durable queue creation, recovery and campaign deletion are disabled offline;
- Phone & SIM pairing, live refresh, SIM binding/unbinding and disconnect are disabled offline;
- profile save is disabled offline;
- if an authenticated workspace was not already loaded, cold offline startup explicitly asks the user to reconnect rather than misreporting account setup failure.

## Hard safety boundary

The service worker does **not** cache or replay:
- Supabase/auth requests;
- campaign/recipient API data;
- consent/suppression mutations;
- gateway inventory or pairing API calls;
- exact-SIM preflight/authorization;
- durable queue mutations;
- callbacks/delivery state;
- recovery actions.

There is no `sync`/Background Sync handler and no offline SMS sending queue in Web 0.18.8.

## Preserved contracts

Unchanged from the prior release:
- exact SIM binding and no fallback;
- downloaded/ACKed is not SENT or DELIVERED;
- UNKNOWN/no automatic resend;
- durable queue identity/idempotency;
- campaign draft storage behavior;
- gateway/campaign live-status hooks;
- Supabase schema/RLS/migrations;
- Android gateway behavior;
- `0.18.7-r2` mobile bottom navigation.
