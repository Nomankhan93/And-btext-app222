# Web 0.19.9 — Accessibility & Form Interaction Audit

BulkText Web 0.19.9 closes verified accessibility and form-interaction gaps without changing campaign, gateway, authentication, workspace, offline, PWA or database semantics.

## Audit findings addressed

- Async auth/profile forms now expose busy state to assistive technology.
- Blocking auth/import/composer/campaign failures use alert semantics; successful or non-blocking state changes use polite status semantics.
- Password, managed-email, file-upload and phone-number guidance is programmatically associated with the relevant control.
- Required mapping/draft/campaign controls expose required semantics even where the workflow uses button-driven validation instead of native form submission.
- Message template editors expose invalid state and reference the exact malformed/unsupported-token feedback.
- Phone-number results expose a table caption and a polite live validation summary.
- Existing keyboard focus visibility and 44px interactive-target contracts remain unchanged.

## Explicit non-goals

This release does not change campaign state transitions, recipient eligibility rules, consent/suppression behavior, Android gateway/SIM contracts, Supabase schema/RLS/RPCs, offline draft persistence, PWA fetch/cache strategy, route-loading architecture or observability privacy boundaries.

No database migration is included.
