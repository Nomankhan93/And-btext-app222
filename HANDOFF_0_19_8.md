# Handoff — Web 0.19.8

Release: **Auth, Session & Workspace Boundary Hardening**

Frontend version: `0.19.8`  
Backend contract: `0.18.5`

## Contract

- `AuthProvider` revalidates mounted sessions on reconnect/focus/visibility with `supabase.auth.getUser()`.
- Revalidation is coalesced, generation-guarded and does not sign out on ordinary network failure.
- Invalid session/identity boundaries clear drafts, workspace locators and prior-tab diagnostic history.
- `safeReturnTo()` permits only internal non-auth destinations; protected pathname/search/hash are preserved exactly.
- Workspace authentication/permission loss drops server authority and clears the user-specific offline locator immediately.
- Only the latest workspace request may persist a workspace locator.
- Existing transient workspace refresh behavior still preserves a verified mounted form.

## Non-scope

No DB/RLS/RPC, campaign/send, gateway/SIM, Android, PWA fetch policy, route-loading architecture, bundle-budget or remote telemetry changes.
