# Web 0.19.3 — Release Artifact Integrity & Validation

## Scope

This is a release/reproducibility hardening patch on top of Web `0.19.2`.

- Restores a placeholder-only `.env.example` required by project preflight.
- Updates frontend/release metadata to `0.19.3`; backend contract remains `0.18.5`.
- Hardens `scripts/release-package.py` so release generation cannot report success unless the source tree, staged source and extracted ZIP all pass project preflight.
- Verifies the extracted release `SHA256SUMS.txt` before declaring the ZIP valid.
- Verifies every ZIP file lives beneath the version-derived root `bulktext-web-0.19.3/`.
- Preserves release exclusions for `.patch-backups/`, `supabase/config.toml.before-*`, local environment files, build output and credential-bearing artifacts.
- Refreshes source regression version markers and the service-worker cache marker to `0.19.3` without changing its fetch strategy.
- Regenerates the source checksum manifest from the corrected clean source set.

## Explicit non-scope

No Supabase migration, RLS/RPC change, Android change, SIM-selection change, campaign/send behavior change, delivery state-machine change, auth/workspace behavior change, route change, offline-draft behavior change, UI redesign or service-worker fetch-strategy redesign.

Frontend: `0.19.3`  
Backend contract: `0.18.5`

## Release command

```bash
npm run test:release-artifact-source-0193 &&
npm run preflight &&
./scripts/release-package.sh
```

A successful packager run must report source/stage/extracted-ZIP preflight PASS, ZIP manifest PASS, path/secret scans PASS, and `ZIP_ROOT=bulktext-web-0.19.3`.
