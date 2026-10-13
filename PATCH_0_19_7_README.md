# Web 0.19.7 — Production Observability & Error Diagnostics

## Scope

This release turns the safe diagnostic separation introduced in Web `0.19.5` into a production-support capability while preserving the bundle architecture finalized in `0.19.6-r1`.

- Adds a sanitized, bounded client diagnostic buffer in `src/lib/observability.ts`.
- Captures handled network/auth/permission/internal errors through the shared `errorMessage()` boundary.
- Captures browser errors, unhandled rejections, top-level React render failures and lazy route failures.
- Stores only safe categorical metadata; raw messages/details/hints and user/contact/token/URL data are not retained.
- Keeps at most 25 events in `sessionStorage` for the current browser-tab session.
- Adds a Settings **Technical diagnostics** panel to copy or clear the sanitized support snapshot.
- Routes remaining auth/profile error presentation through the shared safe error helper.
- Adds focused source/runtime regressions for redaction, bounded storage and export behavior.

## Explicit non-scope

No database migration, RLS/RPC, remote telemetry vendor/backend, campaign/send workflow, gateway/SIM behavior, delivery state, offline draft model, service-worker fetch strategy, route-splitting architecture, bundle-budget threshold or broad visual redesign.

Frontend: `0.19.7`
Backend contract: `0.18.5`

## Required validation

```bash
npm run test:observability-source-0197
npm run preflight
npm run test:observability-0197
npm run test:bootstrap-split-0196r1
npm run check
npm run test
npm run build
npm run test:bundle-0196
git diff --check
./scripts/release-package.sh
git status
```
