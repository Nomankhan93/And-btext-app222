# Web 0.18.7 — Mobile UI/UX

Mobile-first campaign workflow polish for 360px through desktop: compact application navigation, clearer Dashboard/Phone & SIM readiness, touch-safe controls, campaign import/review improvements, mobile campaign cards, and explicit Queue → Downloaded/ACKed → SENT → DELIVERED tracking. Frontend version is 0.18.7; backend contract remains 0.18.5 and no migration is included. See `PATCH_0_18_7_README.md` and `VALIDATION_0_18_7.md`.

# Web 0.18.6-r2 — Campaign Live Status Consistency

Queue and delivery status now refresh together. See docs/CAMPAIGN_LIVE_STATUS_0186_R2.md. Backend stays 0.18.5; no migration.

# Current corrective release: Web 0.18.6-r1

Phone & SIM now refreshes automatically while visible and on tab/network return. Read docs/PHONE_SIM_LIVE_STATUS_0186_R1.md. Backend remains 0.18.5; no migration. Earlier release details below remain historical.

# BulkText Web 0.18.6

Current patch: [Draft Reliability, Imports & Campaign UX](docs/DRAFT_IMPORT_CAMPAIGN_UX_0186.md). Frontend 0.18.6 uses the already-applied backend 0.18.5 contract. No new migration is required. Read PATCH_README.md and VALIDATION_RESULTS.md for this release.

## Earlier delivery/recovery foundation

The sections below describe the existing delivery foundation; the current 0.18.5 safety contract takes precedence over historical phase notes.

> **0.18.1 safety stabilization:** real-device acceptance proved that all-failed Android SENT callbacks can coexist with actual SMS delivery. Post-SmsManager callback failure is now UNKNOWN and callback-derived resend is disabled. See `docs/CALLBACK_RETRY_SAFETY_0181.md`.


Web 0.18 adds authoritative SMS attempt history, SENT/DELIVERED callback status, and explicit recovery controls on top of the certified 0.16.4 Simple Send UX.

## What changed

- Adds forward migration `20261001000340_delivery_attempts_callbacks_recovery.sql`.
- Stores immutable per-job attempt numbers and per-part SENT/DELIVERED callback outcomes.
- Campaign detail now shows Awaiting attempt, Submitted, Known sent, Delivered, Failed and UNKNOWN counts.
- Attempt history is visible per recipient.
- Post-submission callback failures do not authorize resend. The 0.18.5 contract disables callback-derived safe retry; UNKNOWN is resolved without resending.
- UNKNOWN/mixed outcomes are never automatically retried; Web can only choose **continue without resending** for that recipient.
- Android callback/recovery RPCs require the paired gateway device credential even though they are reached through the public REST endpoint.

## Safety boundary

Web still owns immutable campaign confirmation, current eligibility re-check, short-lived send authorization and durable queue creation. Exact-SIM/no-fallback semantics from 00320 remain unchanged.

Android 0.18 must register a cloud attempt and persist local SUBMITTING before `SmsManager`. SENT and DELIVERED are separate facts. A delivery failure does not authorize resend. Callback timeout, mixed SENT results, conflicting callbacks, or an ambiguous post-submission boundary become UNKNOWN.

Safe retry is never automatic and requires an explicit Web request. A locally staged retry cannot execute until the recovery request has also been acknowledged by the cloud.

## Database

Migration head becomes `20261001000340_delivery_attempts_callbacks_recovery.sql`. Applied migrations through `20261001000330_simple_campaign_flow_bulk_consent.sql` must remain byte-for-byte unchanged.

### 0.18.2 campaign history cleanup
Campaign history now supports per-campaign deletion and bulk safe-history cleanup. Active/ambiguous Android work is retained by database-enforced deletion guards.


## 0.18.4 production safety + release hardening

- Production test-purge RPC/UI removed from the effective schema.
- Final recipient compliance is rechecked at Android attempt start.
- Release packaging/fresh-schema/checksum rules now derive from the current release contract.
- Historical migrations remain forward-only; UNKNOWN automatic resend and exact-SIM rules are unchanged.


## 0.18.3 test cleanup (historical)
0.18.3 introduced a development purge, but **0.18.4 removes its RPCs and UI/API exposure from the effective production schema** because cloud-only deletion is unsafe while Android can retain executable local jobs. The 0.18.3 migration remains unchanged in history.
