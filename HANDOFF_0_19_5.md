# Handoff — Web 0.19.5

Release: **Safe Error Presentation & Diagnostics**

Frontend version: `0.19.5`
Backend contract: `0.18.5`

## Changed contract

- `src/lib/errors.ts`: `errorMessage()` now returns safe display copy and never appends raw backend details/hints/codes.
- `src/lib/errors.ts`: `errorDiagnosticContext()` retains structured raw diagnostics for deliberate development/debug logging.
- Permission, auth and network failures use stable product copy.
- Internal SQL/schema/configuration-style messages fall back to the caller-provided safe context message.
- Safe validation/domain messages remain visible.
- `src/test/errors.test.ts`: focused leakage, classification, fallback and diagnostics-separation coverage.
- `scripts/test-error-presentation0195-source.mjs`: guards the 0.19.5 source contract and no-migration boundary.
- `public/service-worker.js`: cache marker only is bumped to `0.19.5`; fetch/cache strategy is unchanged.

## Non-scope

No migration, RLS/RPC, gateway, SIM, campaign workflow, send/delivery state machine, auth/workspace flow, offline draft, routing or PWA fetch-strategy changes.
