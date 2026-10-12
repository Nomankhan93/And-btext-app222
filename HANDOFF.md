# BulkText handoff — Web 0.18.7

Frontend 0.18.7 is the Mobile UI/UX release built on Web 0.18.6-r2. Backend contract remains 0.18.5 and every Supabase migration is unchanged.

Primary mobile hierarchy is Dashboard → Campaigns → Phone & SIM. Recipient imports, consent/do-not-send, message drafts and Settings remain reachable as secondary tools. Same-tab campaign recovery, failed-import preservation, exact-SIM authorization, live queue/delivery refresh and UNKNOWN/no-resend behavior are preserved.

Read `PATCH_0_18_7_README.md`, `VALIDATION_0_18_7.md` and `CHANGED_FILES_0_18_7.txt`. PWA/service-worker/offline caching remains planned for Web 0.18.8.
