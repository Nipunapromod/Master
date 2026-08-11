# A/L Mastermind PWA v7.1

Files
- index.html  -> upgraded dashboard
- manifest.json -> PWA metadata
- sw.js -> offline service worker
- icons/ -> 192px and 512px app icons

## Important
A service worker will NOT work from `file://`.
Serve this folder through HTTPS (or localhost during development).

Examples:
- GitHub Pages
- Vercel
- Netlify
- Any HTTPS web server

Open the deployed `index.html` in a supported browser and use the browser's
Install/Add to Home Screen option.
