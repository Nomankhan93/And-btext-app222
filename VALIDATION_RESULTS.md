# Validation — Web 0.18.8

See `VALIDATION_0_18_8.md` for the current report and WSL certification commands.

Build-environment checks completed for this artifact include the 0.18.8 PWA source contract, project preflight, TS/TSX syntax parsing, service-worker JavaScript syntax, manifest/package JSON parsing, CSS structural checks, guarded diff inspection, 54-file protected-contract comparison, SHA256 manifest verification and release/ZIP path + secret scans.

The isolated artifact environment cannot complete `npm ci` because its npm cache is missing registry tarballs. Therefore authoritative Vitest/TypeScript/Vite production validation must be run in the user's WSL checkout after applying the patch; do not treat packaging checks as a replacement for that local validation.
