# Handoff — Web 0.18.8

Web `0.18.8` is the PWA/install/offline-safety release over `0.18.7-r2`.

Use `CHANGED_FILES_0_18_8.txt` as the guarded scope list. No Supabase migration exists in this patch. Backend contract remains `0.18.5`.

After applying the overlay, run the validation chain in `VALIDATION_0_18_8.md`. Only commit after npm tests, TypeScript, production build, delivery-contract regression, SHA256 verification and `git diff --check` pass locally.

Post-deploy browser checks are required because actual service-worker installation/update/offline behavior is only authoritative under the deployed HTTPS origin.
