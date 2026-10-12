# Validation — Web 0.18.9

See `VALIDATION_0_18_9.md` for the current report and WSL certification commands.

Artifact-environment checks completed for this release include the 0.18.9 landing/brand source contract, preserved 0.18.8 PWA contract, preserved 0.18.7-r2 mobile-navigation contract, project preflight, TypeScript syntax parsing, service-worker JavaScript syntax, package/manifest JSON parsing, CSS structural checks, guarded 32-file scope inspection, release/ZIP path + secret scans, overlay apply simulation and SHA256 verification.

The isolated artifact environment cannot complete `npm ci` because required registry tarballs are missing from its local npm cache. Authoritative Vitest/TypeScript/Vite/delivery-contract validation must therefore be run in the user's normal WSL checkout after applying the patch.
