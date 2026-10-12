# Web 0.18.9 — Public Landing, Brand System & Auth Experience

## Baseline

Built on Web `0.18.8 — PWA Installation, Service Worker & Offline Safety`.

Frontend version: `0.18.9`
Backend contract: `0.18.5`
Database migration: **none**
Android change: **none**

## What is included

### Public product landing
- `/` is now a real signed-out product landing page; signed-in users visiting `/` are redirected to `/dashboard`.
- Sticky public navigation: Features, How it works, Why BulkText, FAQ, Sign in and Get Started.
- Pricing is intentionally omitted until commercial plans are finalized.
- No `Start Free` claim is used because no free-tier contract is defined.
- Product-led hero: **Send business SMS directly from your own SIM**.
- Controlled dashboard preview uses demo data only; no personal account/device/recipient data is embedded.
- Value strip, four-step workflow, six core feature cards, product status showcase, factual gateway comparison, Android Gateway section, FAQ and final account CTA.
- No ornamental marketing animation system was introduced.

### Marketing wording safety
- `Live send and delivery status` replaces overly absolute real-time delivery wording.
- `Delivery & Recovery Tracking` replaces generic retry marketing.
- Cost copy says **No third-party gateway fee** and explicitly states that carrier balance/bundle still applies.
- Delivery copy states that delivery evidence depends on device/network callbacks and keeps unknown/recovery states explicit.

### Final brand system
Public/auth surfaces now use:
- Deep Navy `#071B4A`
- Primary Blue `#0B63F6`
- Cyan `#08C7F4`
- Light Background `#F5FAFD`
- Main Text `#142936`
- Muted Text `#647784`

The authenticated workspace adopts the official BulkText app icon/wordmark and primary brand tokens without redesigning workflow screens.

### Auth experience
- Desktop auth screens use the official horizontal BulkText logo and branded product panel.
- Mobile auth screens use the official speech-bubble/SIM app icon with compact BulkText wordmark.
- Login/signup/recovery/verification customer copy removes unnecessary internal Supabase/Mailpit terminology.
- Authentication logic, redirects and Supabase calls are unchanged.

### PWA continuity
- Manifest/offline page use the final navy/light brand colors.
- Service-worker cache version advances to `0.18.9` so the branded shell replaces prior cached UI safely.
- Official horizontal logo is added to static precache.
- Existing install/update/offline safety rules remain unchanged.

## Preserved contracts

Unchanged from prior releases:
- `0.18.7-r2` mobile bottom navigation;
- `0.18.8` install/update/offline safety;
- exact SIM binding and no fallback;
- downloaded/ACKed is not SENT or DELIVERED;
- UNKNOWN/no automatic resend;
- durable queue identity/idempotency;
- campaign draft storage;
- gateway/campaign live-status hooks;
- Supabase schema/RLS/migrations;
- Android gateway behavior.

## Intentionally not included
- Pricing navigation/plans;
- unsupported `Start Free` messaging;
- legal/contact links without corresponding product pages/endpoints;
- large animation libraries or decorative marketing motion;
- database or Android changes.
