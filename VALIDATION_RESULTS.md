# Validation — Web 0.18.10-r1

See `VALIDATION_0_18_10_R1.md` for the current certification report and WSL release gates.

Artifact-environment source/functional checks currently pass: r1 reliability **56 assertions**, service-worker shell integrity **8**, base offline draft **34**, PWA **32**, landing/brand **32**, mobile navigation **23**, Phone & SIM a1 **28**, plus project preflight. Full Vitest/TypeScript/Vite gates still require the normal WSL checkout because the isolated build container does not have a complete npm dependency cache.
