# JRVS Property Co. — V0.11.0

## Photo Studio navigation and workspace cleanup

- Removed the duplicate top navigation bar; the right-side editing tabs are now the only workspace navigation.
- Scoped the Light & tonal range and Detail & finishing accordion containers to their corresponding tabs, preventing empty section headings.
- Geometry-only rotate controls now appear in Geometry.
- Property presets, histogram, undo/redo, before/after, batch application and save/export actions remain available.
- Existing photos, edits, browser storage, IndexedDB photo library and Supabase data/schema are preserved.

## Deploying
1. Extract this ZIP.
2. Upload all files and folders inside it to the root of the existing GitHub repository, replacing matching files.
3. Keep your existing browser profile and app URL. Do not clear site data.

## Release version
- App version: `0.11.0`
- `version.json`: `0.11.0`
- Service-worker cache: `jrvs-property-co-v0.11.0`
