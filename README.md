# JRVS Property Co. — V0.36.0

PC-first property photography and business workflow app for JRVS Property Co.

## Current release

**V0.36.0 — Multi-scale Adaptive Interior Development**

### Photo Studio
- One-click Rental Auto Enhance analyses each image and applies a restrained, image-specific starting correction.
- V0.36 advances local interior exposure balancing with a dual-scale illumination field.
- Uses a robust upper-mid luminance reference to better distinguish dim room regions from bright parts of a mixed-light interior.
- Applies spatial shadow/midtone recovery with smooth regional transitions and protection for deep blacks.
- Uses a gradual highlight shoulder to preserve tonal separation in bright cabinetry, walls and benchtops.
- Retains RGB relationships during luminance recovery to reduce colour shifts and channel clipping.
- Existing Develop, Colour, Finish, Geometry, Export, Retouch, histogram, zoom, compare, undo/redo and save-copy workflows remain.
- The algorithm is deterministic, runs locally in the browser and does not send photographs to an AI service.
- It is not semantic object recognition: it does not identify windows, walls, furniture or cabinetry individually, and cannot recreate detail clipped in the source.

### RAW and photo handling
- Existing CR2/RAW import and preview-decoding path is unchanged.
- Original photo blobs remain untouched; edits are saved as separate copies.
- Existing versioned edit recipes remain supported.

### Business workflow and data preservation
- Existing jobs, clients, quotes, invoices, package catalogue, photo records and calendar data are retained.
- No localStorage keys, IndexedDB schema, photo object store or Supabase schema changes are required.
- No data reset or migration is performed by this release.

## Known limitations
- The browser-based RAW path remains dependent on the existing decoder and preview workflow; this release does not introduce a new camera-profile RAW engine.
- Local tone mapping is based on luminance distribution, not semantic segmentation or precise window masks.
- True window blending, local brush masks, lens-profile correction, content-aware healing and AI object removal are not included.
- Review each result at full size before client delivery, especially high-contrast rooms and genuinely clipped highlights.

## Deploying to GitHub Pages
1. Keep a copy of your current working release as a rollback.
2. Extract the ZIP.
3. Upload the **contents** of the extracted folder into the root of the existing GitHub repository, replacing matching files.
4. Commit the changes and allow GitHub Pages to publish.
5. Use the in-app update check/refresh if the new version is not detected automatically.

Do not clear browser/site data to force an update. Do not delete `jrvs-data`, `jrvs-calendar` or the `jrvs-photo-library` IndexedDB database.

## Release metadata
- App version: `0.36.0`
- `version.json`: `0.36.0`
- Service-worker cache: `jrvs-property-co-v0.36.0`
