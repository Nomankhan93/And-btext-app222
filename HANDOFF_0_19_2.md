# Handoff — Web 0.19.2

## Release identity

- Frontend: `0.19.2`
- Backend contract: `0.18.5`
- Patch: Installed PWA Vertical Scrolling Fix

## What changed

Installed PWA mode had a standalone-only `overscroll-behavior-y: none` rule even though normal browser mode did not. Web `0.19.2` removes that special restriction and makes the document/root vertical scroll contract explicit. It deliberately avoids fixed-height root containers or global touch-action restrictions, so horizontal table scrolling and normal touch interactions remain available.

The fixed mobile bottom nav remains unchanged, content keeps safe-area bottom padding, and the mobile Tools sheet keeps its own bounded vertical scrolling. Service-worker cache identity advances to `0.19.2` so installed clients can activate the corrected stylesheet.

## Non-scope

No database, Android, SIM-selection, send/delivery, campaign workflow, public-root routing, auth or offline-draft behavior change.
