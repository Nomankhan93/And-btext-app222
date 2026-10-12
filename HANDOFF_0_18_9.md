# Handoff — Web 0.18.9

Web `0.18.9` adds the public product landing page, final BulkText navy/blue/cyan brand system, official logo/icon integration and refreshed auth experience over `0.18.8`.

Use `CHANGED_FILES_0_18_9.txt` as the guarded scope list. Backend contract remains `0.18.5`; no Supabase migration or Android change exists in this patch.

The landing page deliberately omits Pricing and `Start Free` until those product contracts exist. Delivery copy uses `Live send and delivery status` and `Delivery & Recovery Tracking`, and gateway cost copy explicitly preserves carrier balance/bundle costs.

After applying the overlay, run the validation chain in `VALIDATION_0_18_9.md`. Post-deploy verify the signed-out `/` landing, auth pages, PWA update/cache rollover and the authenticated mobile bottom navigation.
