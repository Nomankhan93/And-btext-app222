# Web 0.18.10-r1 — Offline Draft & PWA Reliability

BulkText Web `0.18.10-r1` is a corrective reliability release on top of `0.18.10-a1`. It protects browser-local campaign drafts from stale-tab overwrites, waits for true IndexedDB transaction completion before reporting a durable save, reconciles tab and device copies before editing, restores StrictMode autosave behavior, makes discard/clear durable, enables account-isolated local-draft access after an offline cold start and hardens the PWA shell against incomplete installs.

Frontend version is `0.18.10-r1`; backend contract remains `0.18.5`. There is no Supabase migration, RLS/RPC change, delivery state-machine change, Android change or SIM-selection change.

The `0.18.10-a1` Phone & SIM mobile responsive correction is preserved unchanged.

See `PATCH_0_18_10_R1_README.md`, `VALIDATION_0_18_10_R1.md` and `HANDOFF_0_18_10_R1.md`. Historical `0.18.10` and `0.18.10-a1` documents remain in the repository for release history.
