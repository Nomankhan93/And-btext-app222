# BulkText handoff — Web 0.18.7

Web 0.18.7 is a frontend-only Mobile UI/UX patch based on 0.18.6-r2. The backend contract remains 0.18.5 and no database migration is included.

The main mobile hierarchy is Dashboard → Campaigns → Phone & SIM, with Recipient imports, Consent / do-not-send, Message drafts and Settings retained as secondary tools. Campaign creation preserves same-tab draft/import recovery. Campaign detail preserves exact-SIM, consent, queue and UNKNOWN/no-resend safety while making user-facing delivery progress easier to read.

PWA installation, service worker and offline caching remain out of scope for this patch and belong to Web 0.18.8.

Run the commands in `VALIDATION_0_18_7.md` after applying the patch in the normal WSL project checkout. Hosted database changes are not required.
