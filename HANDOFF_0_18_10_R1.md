# Handoff — Web 0.18.10-r1

## Release identity

- Frontend: `0.18.10-r1`
- Backend contract: `0.18.5`
- Supabase migration: none
- Android release: unchanged
- Base: `0.18.10-a1`

## Purpose

`0.18.10-r1 — Offline Draft & PWA Reliability` closes the reliability gaps found in the 0.18.10 audit without changing campaign send/delivery contracts.

## Implemented corrections

1. **Revision-protected durable drafts**
   - Session and IndexedDB draft envelopes carry a revision.
   - Durable writes use compare-and-swap semantics.
   - A stale tab cannot silently overwrite a newer local version.
   - Conflicts require an explicit “saved device version” or “keep this tab version” choice.

2. **True IndexedDB commit semantics**
   - Save, delete and clear operations wait for transaction `complete`.
   - Transaction `abort`/`error` is treated as failure even if the individual request already reported success.
   - “Saved on this device” is only shown after the durable transaction commits.

3. **Hydration and StrictMode safety**
   - Session and IndexedDB copies are always reconciled before editing is enabled.
   - IndexedDB unavailable/invalid is distinct from “no saved draft”.
   - StrictMode effect setup/cleanup is symmetric so autosave is not permanently disabled by development effect replay.

4. **Durable discard and account cleanup**
   - Discard waits for durable delete completion before navigation.
   - Sign-out awaits draft cleanup where browser storage supports it; server sign-out does not depend on local cleanup succeeding.

5. **Offline cold-start draft access with authorization separation**
   - A minimal account-scoped workspace locator is cached locally.
   - It can reopen `/campaigns/new` for that signed-in account when workspace RPC is unavailable.
   - Local locator authority never enables dashboard, device, recipient-preparation, review or send operations.
   - Server verification remains mandatory for every server-side campaign action.

6. **PWA shell integrity**
   - Required shell HTML/assets are fetched and validated before the versioned shell cache is committed.
   - A required JS/CSS/icon/fallback failure rejects service-worker installation.
   - Cached shell HTML is immutable for the installed worker generation so it stays paired with its hashed assets.

## Preserved contracts

- Backend contract remains `0.18.5`.
- No Supabase migration, schema, RPC or RLS change.
- No campaign queue, callback, UNKNOWN/no-resend or exact-SIM behavior change.
- No Android application change.
- `0.18.10-a1` Phone & SIM mobile containment remains present.

## Release gate

Run the combined WSL validation command in `VALIDATION_0_18_10_R1.md` before commit/push/deploy. After deployment, perform browser-level multi-tab, offline cold-start and PWA failed-asset acceptance checks.
