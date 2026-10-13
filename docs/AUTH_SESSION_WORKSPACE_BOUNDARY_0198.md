# Auth, Session & Workspace Boundary Hardening — Web 0.19.8

Web `0.19.8` hardens frontend identity and workspace boundaries without changing the backend contract (`0.18.5`) or adding database migrations.

## Session boundary

- Existing sessions are revalidated against Supabase when the browser reconnects, regains focus, or becomes visible.
- Revalidation uses `auth.getUser()` rather than trusting only locally cached session state.
- Concurrent lifecycle checks are coalesced and stale responses cannot mutate a newer session.
- Authentication/identity-invalidating responses clear account-scoped campaign drafts, remembered workspace locators and prior-tab diagnostics before the local session is dropped.
- Network-only/background validation failures are diagnostic events but do not log out an otherwise mounted user.
- Account switches clear previous account-scoped browser state.

## Protected return targets

- `RequireAuth` preserves pathname, query string and hash in the protected `returnTo` value.
- Login and auth callback destinations are normalized through `safeReturnTo()`.
- Absolute URLs, protocol-relative URLs, backslash authority tricks and `/auth/*` loops are rejected and fall back to `/dashboard`.

## Workspace boundary

- Only the latest workspace request may update UI state or the offline workspace locator.
- A server authentication or permission failure immediately removes previously verified workspace authority instead of preserving the mounted privileged workspace.
- A revoked/invalid locator is removed from local storage.
- Authentication-class workspace failures request session revalidation.
- Workspace verification is refreshed after reconnect/focus/visibility while transient network/server failures continue to preserve a currently verified mounted form.

## Non-scope

No campaign/send state changes, gateway/SIM changes, Android changes, Supabase schema/RLS/RPC changes, PWA fetch-policy changes, route-loading architecture changes, bundle-budget relaxation or remote observability backend is introduced.
