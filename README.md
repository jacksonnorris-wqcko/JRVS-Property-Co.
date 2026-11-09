# JRVS Property Co. — V0.38.0

PC-first property photography and business workflow app for JRVS Property Co.

## Current release — V0.38.0
**Rental Interior Detail & Colour Refinement**

### Photo Studio
- Extends V0.37 adaptive interior development and region-aware highlight compression.
- Adds a restrained multi-scale local-contrast pass to improve separation and definition in interior midtones.
- Protects deep shadows and near-white surfaces from excessive local-contrast amplification.
- Refines the conservative neutral-colour sample used by one-click Rental Auto Enhance, with a tighter neutral-pixel selection and confidence-scaled, capped temperature/tint correction.
- Retains image-specific exposure analysis, regional shadow recovery, highlight shoulder, shadow colour protection and original-preserving save-copy workflow.
- No AI service or external photo upload is used.

### RAW and data preservation
- Existing CR2/RAW import and preview-decoding path is unchanged.
- Original photo blobs remain untouched; edits are saved as separate copies.
- Existing jobs, clients, quotes, invoices, package catalogue, calendar and photo records are preserved.
- No localStorage keys, IndexedDB schema, photo object store or Supabase schema changes.
- No data reset or migration is performed.

## Known limitations
- Local contrast is luminance-based, not semantic object recognition.
- Neutral colour estimation is conservative and may be less reliable in rooms dominated by coloured surfaces or mixed lighting.
- Highlight compression cannot recreate detail clipped in all RAW channels.
- This is not AI window replacement, a bracketed HDR merge or a new sensor-level RAW developer.
- Review full-resolution exports before client delivery.

## Deploying to GitHub Pages
1. Keep V0.37.0 as a rollback copy.
2. Extract this ZIP.
3. Upload the **contents** of the extracted folder into the root of the existing GitHub repository, replacing matching files.
4. Commit and allow GitHub Pages to publish.
5. Use the in-app update check/refresh if needed.

Do not clear browser/site data to force an update. Do not delete `jrvs-data`, `jrvs-calendar` or the `jrvs-photo-library` IndexedDB database.

## Release metadata
- App version: `0.38.0`
- `version.json`: `0.38.0`
- Service-worker cache: `jrvs-property-co-v0.38.0`
