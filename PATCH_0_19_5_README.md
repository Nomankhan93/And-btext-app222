# Web 0.19.5 — Safe Error Presentation & Diagnostics

## Scope

This is a narrow frontend error-presentation hardening release on top of Web `0.19.4`.

- Separates user-visible failure copy from raw diagnostic context in `src/lib/errors.ts`.
- Stops concatenating Supabase/PostgREST `details`, `hint` and `code` values into normal UI messages.
- Normalizes network failures into a stable connectivity message.
- Normalizes expired/missing authentication into an actionable sign-in message.
- Normalizes permission/RLS failures into non-technical permission copy.
- Falls back to the caller-provided safe message for SQL/schema/configuration-style implementation failures.
- Preserves safe application/domain validation messages such as file, recipient, pairing and message validation errors.
- Keeps raw message/details/hint/code/status available via `errorDiagnosticContext()` for deliberate development diagnostics.
- Adds focused source and Vitest regression coverage.
- Bumps the frontend and service-worker cache marker to `0.19.5`; service-worker fetch/cache strategy is unchanged.

## Explicit non-scope

No Supabase migration, RLS/RPC change, Android change, SIM-selection change, campaign/send behavior change, delivery-state change, auth/workspace flow change, route structure change, offline-draft behavior change, PWA fetch-strategy change or visual redesign.

Frontend: `0.19.5`
Backend contract: `0.18.5`

## Required validation

```bash
npm run test:error-presentation-source-0195
npm run preflight
npm run test:error-presentation-0195
npm run check
npm run test
npm run build
git diff --check
./scripts/release-package.sh
git status
```
