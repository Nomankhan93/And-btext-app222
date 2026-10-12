# BulkText handoff — Web 0.18.6

Frontend 0.18.6 builds on Web 0.18.5. Backend contract remains 0.18.5; every migration is unchanged. The user reported the 0.18.5 hosted migrations applied successfully. This task did not access or modify the hosted database.

Read docs/DRAFT_IMPORT_CAMPAIGN_UX_0186.md, PATCH_README.md and VALIDATION_RESULTS.md. Current changes address auth/workspace-driven form resets, same-tab campaign recovery, CSV/XLSX data preservation, file replacement/consent state, composer edit loading, and campaign phone/SIM review.

Android 0.18.5-r1 was delivered separately; its real-device validation is independent of this Web patch. Do not interpret frontend or mocked-API tests as proof of SMS delivery. UNKNOWN remains non-resendable automatically.

Remaining acceptance: deploy through the usual Web workflow, then exercise same-tab restore, account isolation, actual user import files, saved-draft edits and exact phone/SIM review against hosted Supabase. No message is sent by confirmation alone. Native browser XLSX decompression and live device delivery are not certified by this build. Attempt-history pagination and a broad visual/theme redesign are separate work, not included here.
