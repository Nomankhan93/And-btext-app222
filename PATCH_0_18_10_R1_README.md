# Web 0.18.10-r1 — Offline Draft & PWA Reliability

This is a corrective reliability patch over `0.18.10-a1`. It does not introduce a new sending capability and does not change the backend contract.

## Scope

### Draft concurrency
- Revisioned session + IndexedDB draft envelopes.
- Atomic IndexedDB compare-and-swap writes.
- Explicit stale-tab conflict UI instead of last-writer-wins overwrite.
- Legacy 0.18.10/a1 browser drafts remain readable as revision `0`.

### Durable storage semantics
- Save/delete/clear wait for IndexedDB transaction completion.
- Request success followed by transaction abort is a failed operation.
- Typed persistent reads distinguish `found`, `missing` and `unavailable`.

### Hydration / lifecycle
- Editing is gated until tab and durable copies are reconciled.
- StrictMode effect replay no longer leaves autosave disabled.
- Discard waits for the durable deletion before leaving the page.

### Offline cold start
- Server-verified workspace identity is cached as an account-scoped local locator.
- The locator permits only local campaign draft access at `/campaigns/new` when server workspace verification is unavailable.
- Recipient preparation, review, devices and sending continue to require `authority === 'server'` and network availability.

### PWA shell integrity
- Service-worker install fails closed if any required shell asset is non-successful.
- Shell HTML and referenced hashed build assets are installed as one generation.
- Later online navigation does not replace the installed offline shell HTML with a different build.

## Explicit non-scope

- Supabase migrations, schema, RPC and RLS.
- Queue/delivery/callback state machine.
- UNKNOWN/no-resend behavior.
- Android gateway and device protocol.
- Exact-SIM selection.
- Campaign send authorization rules.
- `0.18.10-a1` Phone & SIM visual correction, which is preserved as-is.

## Acceptance expectations

- Stale tab cannot overwrite a newer revision without an explicit choice.
- A request-level IndexedDB success followed by transaction abort never reports “saved”.
- User cannot edit before local reconciliation finishes.
- StrictMode autosave remains active after effect replay.
- Discard cannot be followed by immediate resurrection of the deleted durable draft.
- Offline cold-start exposes only the current signed-in account’s local campaign draft route.
- Cached local workspace identity never authorizes server actions.
- A required shell asset returning 404/500 prevents the new worker from installing.
- Successful installed shell keeps matching JS/CSS assets for that worker generation.
