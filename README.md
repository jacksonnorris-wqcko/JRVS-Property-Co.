# JRVS Property Co. — V0.40.0

PC-first property photography and business workflow app for JRVS Property Co.

## Current release — V0.40.0
**Rental Auto Enhance: natural tonal balance refinement**

### Photo Studio
- Reduces adaptive shadow recovery so naturally dark living areas retain depth instead of lifting towards grey.
- Relaxes highlight compression so white cabinetry, benchtops and bright architectural surfaces remain brighter while retaining a gentle upper-end roll-off.
- Refines automatic contrast and white-point recommendations.
- Adds a restrained increase to luminance-based midtone detail separation.
- Retains image-specific analysis, conservative neutral-colour estimation and original-preserving save-copy workflow.
- No AI service or external photo upload is used.

### RAW and data preservation
- Existing CR2/RAW import and preview-decoding path is unchanged; this is not genuine sensor-level RAW development.
- Original photo blobs remain untouched; edits are saved as separate copies.
- Existing jobs, clients, quotes, invoices, package catalogue, calendar and photo records are preserved.
- No localStorage keys, IndexedDB schema, photo object store or Supabase schema changes.
- No data reset or migration is performed.

## Known limitations
- Local tone processing is luminance-based, not semantic room/window recognition.
- Highlight compression cannot recreate detail clipped in all source channels.
- This is not AI window replacement, a bracketed HDR merge or a new sensor-level RAW developer.
- Compare the same source image against the approved original-app benchmark and inspect full-resolution exports before client delivery.

## Deploying to GitHub Pages
1. Keep V0.38.0 as the immediate rollback copy.
2. Extract this ZIP.
3. Upload the **contents** of the extracted folder into the root of the existing GitHub repository, replacing matching files.
4. Commit and allow GitHub Pages to publish.
5. Use the in-app update check/refresh if needed.

Do not clear browser/site data to force an update. Do not delete `jrvs-data`, `jrvs-calendar` or the `jrvs-photo-library` IndexedDB database.

## Release metadata
- App version: `0.40.0`
- `version.json`: `0.40.0`
- Service-worker cache: `jrvs-property-co-v0.40.0`
