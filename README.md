# Web 0.19.3 — Release Artifact Integrity & Validation

BulkText Web `0.19.3` hardens clean-source release generation and validation. The required placeholder-only `.env.example` is restored; source, staged source and extracted release ZIP must all pass project preflight; extracted checksums and the version-derived ZIP root are verified before a release is declared valid.

Frontend version is `0.19.3`; backend contract remains `0.18.5`. There is no Supabase migration, RLS/RPC change, delivery state-machine change, Android change, SIM-selection change, campaign/send behavior change, auth/workspace change, routing change or offline-draft behavior change. The service-worker change is limited to the `0.19.3` cache marker; its fetch strategy is unchanged.

See `PATCH_0_19_3_README.md`, `HANDOFF_0_19_3.md` and `VALIDATION_0_19_3.md` for this release.
