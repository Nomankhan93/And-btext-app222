# Current Patch — Web 0.19.2

**Installed PWA Vertical Scrolling Fix**

Installed/standalone PWA pages now retain normal vertical document scrolling while preserving the fixed mobile bottom navigation and the Tools sheet's internal scrolling. The old standalone-only `overscroll-behavior-y: none` restriction is removed and regression coverage guards the scroll contract.

See `PATCH_0_19_2_README.md`.
