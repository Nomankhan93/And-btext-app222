# Validation — Web 0.19.2

Required release gates:

- `npm run preflight`
- `npm run test:pwa-scroll-source-0192`
- `npm run test:pwa-scroll-0192`
- preserved `test:pwa-source-0188`
- preserved `test:mobile-ui-source-0187`
- preserved `test:public-root-source-0191`
- preserved `test:offline-reliability-source-01810r1`
- `npm run check`
- `npm run test`
- `npm run build`
- `git diff --check`

Manual installed-PWA certification:

1. Install/update the PWA and reopen it in standalone mode.
2. Open a page whose content is taller than the viewport.
3. Confirm vertical swipe scroll reaches content above the fixed bottom navigation.
4. Confirm Home/Campaigns/Phone & SIM/Tools navigation remains tappable.
5. Open Tools and confirm the sheet itself scrolls when its content exceeds its bounded height.
6. Confirm horizontally scrollable data/table containers still pan horizontally.
