# Web 0.19.9 — Accessibility & Form Interaction Audit

BulkText Web `0.19.9` closes verified form-accessibility gaps on top of the `0.19.6-r1` bootstrap split, `0.19.7` privacy-safe diagnostics and `0.19.8` auth/session/workspace hardening.

Async auth/profile forms now expose busy and live feedback semantics; password, managed-email, upload and phone-number help is programmatically associated; required/invalid states are exposed on key authoring controls; message-template errors are linked to their editors; and phone-number result status/table naming is accessible.

Frontend version is `0.19.9`; backend contract remains `0.18.5`. No database migration is included.

See `PATCH_0_19_9_README.md`, `HANDOFF_0_19_9.md`, `VALIDATION_0_19_9.md` and `docs/ACCESSIBILITY_FORM_INTERACTION_0199.md`.
