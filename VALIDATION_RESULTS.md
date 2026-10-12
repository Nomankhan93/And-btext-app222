# Validation — Web 0.18.10-a1

See `VALIDATION_0_18_10_A1.md` for the current certification report and WSL release gates.

Artifact source contracts passed: Phone & SIM a1 **28 assertions**, mobile navigation **23**, PWA **32**, landing/brand **32**, offline draft **34**, plus project preflight and clean release path/secret scans. Dependency installation timed out in the isolated container, so Vitest/TypeScript/Vite semantic release gates remain required in the normal WSL checkout before deploy.
