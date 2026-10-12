# Web 0.18.10-a1 — Phone & SIM Mobile Responsive Correction

## Scope

This is a presentation-only corrective release on top of Web `0.18.10`.

It fixes the mobile `Phone & SIM` workspace so wide pairing/history content stays contained inside the viewport and only intentionally scrollable regions scroll horizontally.

### Corrected
- Phone & SIM page-level horizontal overflow caused by wide child content.
- Pairing QR card sizing on narrow mobile screens.
- One-use pairing code scaling/wrapping on narrow screens.
- Pairing action buttons on mobile.
- Device/SIM text wrapping and card containment.
- Pairing-history table containment so the table may scroll inside its wrapper without widening the entire page.

### Explicitly unchanged
- Pairing-code generation and revocation behavior.
- Android gateway/device lifecycle.
- SIM discovery, explicit SIM binding and clear-SIM behavior.
- Campaign send/delivery state machine.
- Backend contract, RPCs, RLS, schema and migrations.
- Service worker and offline draft behavior.
- Android app behavior.

Frontend version: `0.18.10-a1`
Backend contract: `0.18.5`
Database migration: **none**

The planned reliability correction keeps its existing name: **`0.18.10-r1 — Offline Draft & PWA Reliability`**.
