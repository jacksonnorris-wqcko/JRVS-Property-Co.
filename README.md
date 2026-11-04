# JRVS Property Co. — V0.5.7

A desktop-first, mobile-responsive property photography business manager built as a Progressive Web App (PWA).

## Release V0.5.7 — Photo Export

- Added **Download** to each photo card for downloading the stored full-size image file.
- Added **Download selected (.zip)** to the project gallery batch toolbar. Select any combination of Original or Edited photos and export them together in one ZIP.
- ZIP export preserves each stored photo blob exactly as saved: it does not resize, recompress, or substitute the gallery thumbnail.
- ZIP entries are organised inside a folder named after the project. Duplicate filenames are safely renamed.
- Export runs locally in the browser; no third-party ZIP service or cloud upload is required.
- Updated the app version, `version.json`, service-worker cache and this README to V0.5.7.

### Export workflow

1. Open a project's photo gallery.
2. Select the photos you want to deliver. Use **Select all visible** to select every photo currently shown by the Original/Edited filter.
3. Choose **Download selected (.zip)**. The ZIP contains the full stored files, including the original or edited version selected.
4. To download one image only, use **Download** on its photo card.

On iPhone/iPad, downloads are handled by Safari/iOS and may appear in the Files app or the browser download list. ZIP creation is capped at 300 MB per batch to reduce the risk of exhausting browser memory; export larger projects in smaller batches. Large ZIPs still require enough free device memory/storage.

## Deploying to GitHub Pages

1. Download and extract the release ZIP.
2. Upload the **contents** of the extracted folder into the root of the existing GitHub repository, replacing matching files. Do not upload the ZIP itself or put files inside an extra folder.
3. Keep the existing GitHub Pages URL and browser profile.
4. Allow the app update to complete. If the old version remains visible, close the installed PWA/browser tab completely and reopen it. Do not clear browser data or site storage.

## Data preservation

This release adds read-only export of existing photo blobs. It does not intentionally change the photo IndexedDB schema, business-data keys, Supabase configuration or database schema. Export does not delete or modify stored photos.

## Main files

- `index.html` — application interface and application logic
- `mobile.css` — responsive/mobile styles
- `sw.js` — service worker and cache/update handling
- `version.json` — release version metadata
- `manifest.json` — PWA metadata
- `assets/` — app icons and supporting assets
- `supabase-setup.sql` — existing Supabase setup reference (no SQL changes in this release)

## Verification note

This release was checked for JavaScript syntax, ZIP structure logic, version consistency and README inclusion. Browser downloads, especially on iPhone, have not been live-tested in the user's deployment.
