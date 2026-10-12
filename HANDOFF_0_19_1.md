# Handoff — Web 0.19.1

Release: **Public Landing Root Routing Fix**

- Frontend: `0.19.1`
- Backend contract: `0.18.5`
- Database migration: none
- Android change: none

The public landing page introduced in 0.18.9 already existed and remains visually unchanged. The defect was route ownership: a protected pathless route tree also declared an index route, so `/` could be captured by `RequireAuth` and redirect signed-out visitors to `/auth/login?returnTo=%2F`. Web 0.19.1 removes that protected index owner and leaves the explicit public `/` route as the single root owner.

App-level regression coverage now verifies signed-out root landing, signed-in root dashboard redirect, exact protected-route returnTo encoding and landing-to-login navigation.
