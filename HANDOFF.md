# Current Handoff — Web 0.19.5

Current frontend release: `0.19.5`
Backend contract: `0.18.5`

`0.19.5 — Safe Error Presentation & Diagnostics` is a narrow frontend error-boundary hardening release. User-visible failures no longer concatenate raw PostgREST/Supabase details, hints or codes, while safe domain validation messages remain intact and raw diagnostic context remains separately available for deliberate debugging.

No database, Android, send/delivery, SIM-selection, campaign workflow, route structure, auth/workspace flow, offline-draft or PWA fetch-strategy behavior changes are included.

See `HANDOFF_0_19_5.md`.
