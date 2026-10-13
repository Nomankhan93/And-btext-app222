# Handoff — Web 0.19.9

Frontend: `0.19.9`  
Backend contract: `0.18.5`

`0.19.9 — Accessibility & Form Interaction Audit` hardens programmatic form semantics and live feedback across the highest-use auth and campaign-authoring surfaces.

Key guarantees:

- auth/profile async forms announce busy/error/status changes;
- helper text is connected to password/email/file/phone controls;
- required and invalid form states are exposed to assistive technology;
- message-template errors are explicitly linked to the affected editor;
- phone normalization results have accessible live status and table naming;
- existing 44px target-size, keyboard focus, PWA, route-split and bundle-budget contracts remain mandatory.

No Supabase migration is included.
