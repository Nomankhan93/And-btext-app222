# Validation — Web 0.18.10

See `VALIDATION_0_18_10.md` for the current certification report and WSL release command.

Artifact checks completed successfully for the 0.18.10 source contract (34 assertions), preserved PWA/mobile/landing source contracts, project preflight, 96-file TypeScript/TSX syntax audit, IndexedDB persistence runtime smoke, service-worker syntax, CSS structure, 46-file protected-contract comparison, release path/secret scans and deterministic ZIP packaging.

The isolated environment could not finish `npm ci`, so authoritative Vitest, TypeScript semantic checking, Vite production build and the 0.18.5 delivery SQL contract suite must be run in the normal WSL project before commit.
