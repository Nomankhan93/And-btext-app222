# Current Handoff — Web 0.19.6-r1

Current frontend release: `0.19.6-r1`
Backend contract: `0.18.5`

`0.19.6-r1 — Initial Bootstrap Chunk Correction` closes the remaining bundle-budget failure from Web `0.19.6`. The first 0.19.6 build successfully split secondary routes but still emitted 532,403 bytes of initial static JavaScript, above the 512,000-byte acceptance ceiling.

The corrective release keeps all 0.19.6 route chunks and moves the provider/application bootstrap behind a separate lazy entry. `src/main.tsx` retains `PwaProvider` and `BrowserRouter`; `src/AppBootstrap.tsx` owns the unchanged `AuthProvider → WorkspaceProvider → App` tree. This removes the auth/workspace/Supabase/application graph from the initial static dependency graph without changing authorization or routing semantics.

The bundle gate is not relaxed: initial static JavaScript must remain below 500 KiB, `AppBootstrap` must be a dynamic entry outside that graph, at least 11 dynamic entries must exist, and every emitted JavaScript chunk must be below 500,000 bytes.

The installed-PWA asset-manifest precache remains enabled and the service-worker cache marker is `0.19.6-r1`.

No database, Android, gateway/SIM, campaign/send, delivery-state, auth/workspace authorization, offline-draft data-model or visual-design changes are included.

See `HANDOFF_0_19_6_R1.md`.
