# Validation — Web 0.19.6-r1

Corrective bootstrap source contract: **30 assertions PASS**. Retained source/PWA contracts, including the original 0.19.6 route split, pass for a combined **396 source-level assertions**. The service-worker shell harness remains **10/10 PASS**, and project preflight reports `BulkText Web 0.19.6-r1 / backend 0.18.5 preflight PASS`.

The original WSL 0.19.6 runtime baseline already passed TypeScript, focused route tests and the full **34 files / 164 tests** suite, but its build produced **532,403 bytes** of initial static JavaScript and correctly failed the 500 KiB bundle gate. `0.19.6-r1` addresses that specific residual graph by making `AppBootstrap` dynamic.

Final Vitest/TypeScript/Vite and post-build bundle-budget certification for the corrective source remains required in the normal WSL checkout on Node `24.21.0`; the isolated artifact environment cannot install the frontend dependency tree reliably.

See `VALIDATION_0_19_6_R1.md`.
