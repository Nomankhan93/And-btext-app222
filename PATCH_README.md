# Current Patch — Web 0.19.1

**Public Landing Root Routing Fix**

Signed-out `/` now reaches the existing public landing page instead of the protected auth guard. Signed-in `/` continues to redirect to `/dashboard`, protected-route returnTo behavior is preserved, and App-level routing regressions cover the real route tree.

See `PATCH_0_19_1_README.md`.
