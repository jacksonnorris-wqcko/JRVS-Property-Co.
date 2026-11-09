# JRVS Property Co. — V0.37.0

PC-first property photography and business workflow app for JRVS Property Co.

## Current release — V0.37.0
**Adaptive Bright-Region Management**

### Photo Studio
- One-click Rental Auto Enhance analyses each image and applies an image-specific starting correction.
- Builds on V0.36 multi-scale interior exposure balancing.
- Adds region-aware highlight compression: bright areas in already bright regions receive a stronger, gradual tonal shoulder, while isolated bright details in darker rooms are treated more gently.
- Strengthens global highlight recovery estimates for high-dynamic-range interiors and images with a higher proportion of near-clipped pixels.
- Retains shadow colour protection, deep-black protection and local texture safeguards.
- Existing Develop, Colour, Finish, Geometry, Export, Retouch, histogram, zoom, compare, undo/redo and save-copy workflows remain.
- Runs locally in the browser; no AI service or photo upload is involved.

### RAW and data preservation
- Existing CR2/RAW import and preview-decoding path is unchanged.
- Original photo blobs remain untouched; edits are saved as separate copies.
- Existing jobs, clients, quotes, invoices, package catalogue, calendar and photo records are preserved.
- No localStorage keys, IndexedDB schema, photo object store or Supabase schema changes.
- No data reset or migration is performed.

## Known limitations
- Highlight management is luminance- and region-based, not semantic window detection or masking.
- The engine cannot reconstruct detail genuinely clipped in all RAW colour channels.
- It is not a new sensor-level RAW developer, AI window replacement or HDR bracket merger.
- Review full-resolution exports, particularly windows, reflective benchtops and white cabinetry.

## Deploying to GitHub Pages
1. Keep the previous release ZIP as a rollback.
2. Extract this ZIP.
3. Upload the **contents** of the extracted folder into the root of the existing GitHub repository, replacing matching files.
4. Commit and allow GitHub Pages to publish.
5. Use the in-app update check/refresh if needed.

Do not clear browser/site data to force an update. Do not delete `jrvs-data`, `jrvs-calendar` or the `jrvs-photo-library` IndexedDB database.

## Release metadata
- App version: `0.37.0`
- `version.json`: `0.37.0`
- Service-worker cache: `jrvs-property-co-v0.37.0`
