# Web 0.18.6 validation

Date: 2026-10-11 UTC. Built from the supplied Web 0.18.5 source snapshot.

- PASS: preflight, TypeScript, 107 tests across 22 Vitest files, production Vite build.
- Tests include same-user auth refresh preserving mounted form state, stale account response isolation, late initial login vs sign-out, tab storage account isolation/quota failure, file cancellation/replacement consent, prepared-draft restoration/read retry, exact message whitespace, saved draft ID reuse, partial preparation retry and unmount stop, composer URL loading and unsaved-review blocking, multi-device selection and duplicate confirm prevention, and personalization blocking.
- CSV/XLSX regressions cover duplicate/generated/prototype headers, wider data rows, CR-only line endings, UTF-16 decoding/invalid UTF-8, headerless/over-wide input rejection, internal blank gaps, preamble overflow, malformed ZIP bounds and expanded size limits.
- PASS: 39 existing delivery/recovery SQL scenarios against disposable PGlite; complete migration chain applied there. No hosted calls.
- Runtime: Node 24.19.0 in this build environment. The existing .nvmrc still selects Node 24.21.0 on the user's machine.
- Existing build warning: production JS chunk exceeds 500 kB. No new runtime dependency was added; jsdom/testing-library are development-only DOM test dependencies.

Installer and release evidence is included in the patch ZIP under evidence/ and VALIDATION.md. No live hosted Supabase/browser/phone acceptance, real SMS, cloud deployment, or Android build was performed for this Web-only patch. All existing SQL migrations are unchanged; backend app_meta correctly remains 0.18.5.
