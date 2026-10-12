# Web 0.19.4 — Mobile Dialog Focus Accessibility

## Scope

This is a narrow accessibility correction on top of Web `0.19.3`.

- Moves keyboard focus into the mobile Tools dialog when it opens.
- Traps `Tab` and `Shift+Tab` inside the open dialog and wraps at both boundaries.
- Restores focus to the original Tools trigger when the dialog closes.
- Preserves Escape dismissal, backdrop dismissal and secondary-route navigation behavior.
- Keeps the visual backdrop pointer-dismissible while removing it from the keyboard tab order.
- Preserves native button/link semantics, existing `role="dialog"`, `aria-modal`, label wiring and the current visual design.
- Adds dedicated source and jsdom regression coverage for the focus lifecycle.
- Bumps the frontend and service-worker cache marker to `0.19.4`; service-worker fetch/cache strategy is unchanged.

## Explicit non-scope

No Supabase migration, RLS/RPC change, Android change, SIM-selection change, campaign/send behavior change, delivery state-machine change, auth/workspace change, route structure change, offline-draft behavior change, PWA fetch-strategy change or visual redesign.

Frontend: `0.19.4`
Backend contract: `0.18.5`

## Required validation

```bash
npm run test:mobile-dialog-focus-source-0194
npm run preflight
npm run test:mobile-dialog-focus-0194
npm run test:mobile-ui-0187
npm run check
npm run test
npm run build
git diff --check
./scripts/release-package.sh
git status
```
