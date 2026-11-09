# JRVS Property Co. — V0.39.0 Release Notes

## Rental Auto Enhance — natural tonal balance refinement

V0.39 adjusts the deterministic local tone engine to better match the approved original-app reference image.

- Reduces adaptive shadow recovery so naturally dark living areas retain depth instead of lifting towards grey.
- Reduces the scene-wide shadow lift floor to avoid a washed-out appearance.
- Relaxes the highlight shoulder and moves its transition higher, allowing white cabinetry, benchtops and bright architectural surfaces to remain brighter.
- Retains a gentle upper-end roll-off to avoid harsh clipping where source detail remains available.
- Adds a small increase to luminance-based midtone detail separation.
- Refines automatic contrast and white-point recommendations while retaining conservative colour estimation.

## Preservation and compatibility

- Built directly on V0.38.0.
- Existing photo import, RAW/CR2 preview path, editing controls, recipe handling, retouching, jobs, clients, quotes, invoices, package catalogue, calendar, local storage and Supabase integration are unchanged.
- No localStorage keys, IndexedDB stores/schemas, Supabase schema, or user records are changed.
- Original photo blobs remain untouched; edits continue to be saved as separate edited copies.
- Service-worker cache version updated to V0.39.0 for normal application updates.

## Validation and limitations

- Inline JavaScript syntax and ZIP integrity checks are performed for this release.
- The image engine remains deterministic browser-side luminance processing, not semantic AI masking or a bracketed HDR merge.
- The CR2 path remains the existing embedded camera JPEG preview; this release does not add genuine RAW sensor development.
- Compare the same original source file against the approved baseline and inspect full-resolution exports before client delivery.

## Installation

Extract the ZIP and upload its contents into the existing GitHub repository root, replacing matching files. Keep V0.38.0 as rollback. Do not clear browser data. The service worker should fetch the new version and update its cache normally.
