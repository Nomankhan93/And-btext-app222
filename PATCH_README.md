# Current Patch — Web 0.19.6-r1

**Initial Bootstrap Chunk Correction**

The 0.19.6 route split reduced the main bundle substantially but its initial static JavaScript still measured 532,403 bytes and failed the 500 KiB release gate. This corrective patch dynamically loads the preserved `AuthProvider → WorkspaceProvider → App` bootstrap so the auth/workspace/Supabase/application graph is no longer part of the initial static entry.

The budget is not loosened. The post-build gate now also proves that `src/AppBootstrap.tsx` is a dynamic manifest entry outside the initial static graph and that the largest emitted JavaScript chunk stays below 500,000 bytes.

See `PATCH_0_19_6_R1_README.md`.
