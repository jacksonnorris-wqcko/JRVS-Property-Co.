# JRVS Property Co. — V0.5.6

A desktop-first, mobile-responsive property photography business manager built as a Progressive Web App (PWA).

## Release V0.5.6

- Fixed the project photo gallery so switching between **Original photos** and **Edited photos** immediately refreshes the gallery.
- Changing the project filter or photo search also refreshes the gallery and clears the current batch selection.
- Updated the app's internal version constant and all version labels to **V0.5.6**.
- Updated `version.json` and the service-worker cache version to `0.5.6` so the existing update flow can detect the release.

## Deploying to GitHub Pages

1. Download and extract the release ZIP.
2. Upload the **contents** of the extracted folder into the root of the existing GitHub repository, replacing the matching files. Do not upload the ZIP itself or put the files inside an extra folder.
3. Keep the existing GitHub Pages URL and browser profile.
4. Open the app and allow the update to complete. If the old version remains visible, close the installed PWA/browser tab completely and reopen it; do not clear browser data or site storage.

## Data preservation

This release does not intentionally change the app's local business-data keys, photo IndexedDB database, Supabase configuration, or database schema. Do not clear site data as part of deployment.

## Main files

- `index.html` — application interface and application logic
- `mobile.css` — responsive/mobile styles
- `sw.js` — service worker and cache/update handling
- `version.json` — release version metadata
- `manifest.json` — PWA metadata
- `assets/` — app icons and supporting assets
- `supabase-setup.sql` — existing Supabase setup reference (no SQL changes in this release)

## Verification note

This release was checked for consistent version strings, presence of the photo-filter event handlers, and JavaScript syntax. It has not been live-tested in the user's GitHub Pages deployment or against their existing browser data.
