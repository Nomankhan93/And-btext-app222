# Handoff — Web 0.19.7

Release: **Production Observability & Error Diagnostics**

Frontend version: `0.19.7`
Backend contract: `0.18.5`

## Contract

- `src/lib/observability.ts` owns the browser diagnostic event model and session-scoped buffer.
- The buffer is capped at 25 events and never intentionally stores raw backend message/details/hint text, phone/contact data, auth tokens, full URLs, query strings or route parameters.
- `errorMessage()` records only non-domain operational failures after classification; expected validation/domain errors remain user-visible without adding diagnostic noise.
- `src/components/AppErrorBoundary.tsx` records top-level React render failures and shows a safe reload fallback.
- `RouteLoadBoundary` records lazy route failures while preserving its existing Retry behavior.
- `src/main.tsx` installs global `error` and `unhandledrejection` capture before rendering.
- Settings exposes the sanitized support snapshot through Copy/Clear controls.
- No remote telemetry endpoint or third-party observability dependency is introduced.
- `0.19.6-r1` bootstrap/route splitting and bundle budgets remain authoritative.

## Non-scope

No DB/RLS/RPC, Android, gateway/SIM, campaign/send, delivery-state, auth/workspace authorization, offline-draft model, PWA fetch strategy or bundle-budget relaxation.
