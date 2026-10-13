# Web 0.19.7 — Production Observability & Error Diagnostics

BulkText Web `0.19.7` adds privacy-safe production client diagnostics on top of the safe error presentation from `0.19.5` and the optimized bootstrap/route loading finalized in `0.19.6-r1`.

Handled operational failures, top-level React failures, lazy route failures, browser errors and unhandled promise rejections are converted into sanitized diagnostic events. Events retain only categorical/support metadata such as release, environment, source, category, severity, constrained code/status/name tokens, coarse route group and online state. Raw backend messages/details/hints, phone/contact data, user email, auth tokens, full URLs, query strings and route parameters are not persisted.

Only the latest 25 events are retained in the current tab's `sessionStorage`. Settings now includes a **Technical diagnostics** panel so the user can copy a sanitized support snapshot or clear it. No remote telemetry service or new backend endpoint is added.

The existing `0.19.6-r1` route/bootstrap split and bundle budgets remain unchanged. Frontend version is `0.19.7`; backend contract remains `0.18.5`.

See `PATCH_0_19_7_README.md`, `HANDOFF_0_19_7.md`, `VALIDATION_0_19_7.md` and `docs/PRODUCTION_OBSERVABILITY_ERROR_DIAGNOSTICS_0197.md`.
