# JRVS Property Co. — V0.0.1 Beta

A simple, desktop-first, mobile-ready HTML/CSS/JavaScript starter.

## Run locally
Open `index.html` in a browser to preview the interface. Browser service-worker updates require hosting over HTTPS (GitHub Pages is HTTPS); service workers do not run from `file://`.

## Publish to GitHub Pages
1. Create a GitHub repository.
2. Upload the contents of this folder to the repository root (not the containing folder).
3. In repository Settings → Pages, select Deploy from a branch and choose `main` / root.
4. Open the published Pages URL.

## Automatic updates and version number
- The visible version is defined in `index.html` (`APP_VERSION`) and shown in the header, sidebar, and Settings.
- `version.json` is checked on app load and when the tab becomes visible.
- `sw.js` caches the app shell and checks for updated files.
- For each release, update `APP_VERSION`, `version.json`, and the cache name in `sw.js`. Publish the files to GitHub. Users may need one reload for the new service worker to take control; after that, updates are checked automatically.
- The Settings page has a manual “Check now” action.

## Current V0.0.1 functionality
- Dashboard with live counts
- Create and save basic jobs
- Create and save client records
- Local browser storage for demo records
- Responsive navigation
- PWA manifest and service worker
- Version display and update checking

## Important limitations
This is a learning prototype. Records are stored in the browser on that device only; there is no cloud sync, secure multi-user login, photo file management, editing engine, quote generation, email delivery, or accounting integration yet. Export/back up important test data before clearing browser data.
