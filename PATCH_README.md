# Current Patch — Web 0.19.7

**Production Observability & Error Diagnostics**

This patch connects BulkText's safe error-classification boundary to a privacy-safe client diagnostic buffer, global/runtime capture and a support-facing Settings export. Diagnostic events are session-scoped, bounded and sanitized; no raw backend details or user/contact/token/URL content is persisted.

No remote telemetry backend, database migration or workflow change is included. Existing `0.19.6-r1` bundle budgets remain mandatory.

See `PATCH_0_19_7_README.md`.
