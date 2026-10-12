# Validation — Web 0.19.3

Release-integrity source contract: **25 assertions PASS**. Preserved source/PWA contracts: **253 assertions PASS**. Project preflight and the hardened source → stage → ZIP extraction release chain pass, including checksum verification, secret/path scans and the version-derived `bulktext-web-0.19.3/` ZIP root with a custom staging directory.

The isolated artifact container could not complete dependency installation, so final Vitest/TypeScript/Vite certification remains required in the normal WSL checkout on Node `24.21.0`.

See `VALIDATION_0_19_3.md`.
