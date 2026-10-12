# Validation — Web 0.19.1

Required release gates:

- `npm run preflight`
- `npm run test:public-root-source-0191`
- `npm run test:public-root-0191`
- preserved landing/PWA/mobile/offline reliability source contracts
- `npm run check`
- `npm run test`
- `npm run build`
- `git diff --check`

Expected routing contract:

- signed-out `/` → public landing page
- signed-in `/` → `/dashboard`
- signed-out protected path/query → `/auth/login?returnTo=<exact encoded path+query>`
- direct `/auth/login` remains public
