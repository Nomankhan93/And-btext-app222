# Current Patch — Web 0.19.3

**Release Artifact Integrity & Validation**

Release generation now validates the source tree, staged clean source and extracted ZIP before reporting success. The missing placeholder-only `.env.example` is restored, the checksum manifest is refreshed, backup paths remain excluded, and the generated source ZIP is required to use the `bulktext-web-0.19.3/` root.

See `PATCH_0_19_3_README.md`.
