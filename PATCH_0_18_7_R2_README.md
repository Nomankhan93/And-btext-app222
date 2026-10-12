# Web 0.18.7-r2 — Mobile Bottom Navigation Refinement

This corrective UI refinement replaces the mobile hamburger/sidebar drawer introduced in Web 0.18.7 with a persistent bottom navigation designed for one-handed campaign work.

## Mobile navigation

Direct destinations:

- Home (`/dashboard`)
- Campaigns (`/campaigns`)
- Phone & SIM (`/devices`)
- Tools

Tools opens an accessible bottom sheet containing:

- Recipient imports
- Consent / do-not-send
- Message drafts
- Settings

The active secondary route keeps the Tools item visually active. The sheet can be dismissed with its close control, backdrop, Escape, a destination selection, or a direct bottom-navigation selection.

## Desktop behavior

The existing desktop sidebar is preserved. The bottom navigation and Tools sheet are hidden above the mobile breakpoint.

## Mobile layout safeguards

- Page content reserves bottom safe-area space so fixed navigation does not cover controls or tables.
- Bottom navigation accounts for `safe-area-inset-bottom` on devices with gesture/home indicators.
- Bottom navigation controls exceed the 44px interaction target.
- Tools destinations use touch-friendly rows and visible keyboard focus.

## Preserved contracts

No campaign, import, draft, consent, SIM-binding, queue, callback, recovery, delivery, authentication, RPC, RLS, schema, migration, or Android behavior is changed.

Frontend version: `0.18.7-r2`
Backend contract: `0.18.5`
Database migration: none
PWA/service-worker/offline caching: still deferred to Web 0.18.8
