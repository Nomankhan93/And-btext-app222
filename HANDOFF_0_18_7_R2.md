# BulkText handoff — Web 0.18.7-r2

Web 0.18.7-r2 is a presentation-only refinement on the validated Web 0.18.7 Mobile UI/UX release.

The mobile drawer is removed and replaced by fixed Home / Campaigns / Phone & SIM / Tools bottom navigation. Tools expands into an accessible bottom sheet for Recipient imports, Consent / do-not-send, Message drafts, and Settings. Desktop navigation remains the existing sidebar.

No backend or Android contract changes are included. `bulktext.backendContractVersion` remains `0.18.5`; no Supabase migration is included or required.

Validation should run the r2 source contract and mobile UI regression suite first, then TypeScript, the complete frontend test suite, production build, delivery contract, checksum validation, and `git diff --check`.

PWA installation, service worker and offline caching remain planned for Web 0.18.8.
