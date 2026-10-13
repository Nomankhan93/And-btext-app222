# Web 0.19.6-r1 — Initial Bootstrap Chunk Correction

BulkText Web `0.19.6-r1` is a narrow corrective release on top of `0.19.6`. The original route-level lazy loading remains intact, but the application/provider bootstrap is now also loaded as a dynamic entry so `AuthProvider`, `WorkspaceProvider`, the application route tree, and their Supabase dependency graph are no longer forced into the initial static JavaScript graph.

`src/main.tsx` keeps the PWA and browser-router boundaries in the initial shell, then loads `src/AppBootstrap.tsx` through `React.lazy()` and a visible Suspense fallback. `AppBootstrap` preserves the existing `AuthProvider → WorkspaceProvider → App` nesting exactly; authorization, workspace provisioning, routing and campaign behavior are unchanged.

The post-build bundle gate still requires initial static JavaScript below 500 KiB and now additionally requires `AppBootstrap` to be a true dynamic manifest entry outside the initial graph. The largest emitted JavaScript chunk must stay below 500,000 bytes so the Vite >500 kB warning is not accepted as a successful correction.

The service-worker asset-manifest precache from `0.19.6` remains in place and its cache marker is bumped to `0.19.6-r1`, so the new bootstrap chunk and all existing lazy route chunks remain available to the installed PWA offline shell.

Frontend version is `0.19.6-r1`; backend contract remains `0.18.5`. There is no Supabase migration, RLS/RPC change, Android change, SIM-selection change, campaign/send behavior change, delivery-state change, auth/workspace authorization change, offline-draft data-model change or visual redesign.

See `PATCH_0_19_6_R1_README.md`, `HANDOFF_0_19_6_R1.md` and `VALIDATION_0_19_6_R1.md`.
