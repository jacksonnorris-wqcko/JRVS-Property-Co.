# JRVS Property Co. — V0.36.0 Release Notes

## Photo Studio: multi-scale adaptive interior development

- Replaced the single-scale regional illumination estimate with a dual-scale luminance field, blending fine and broad spatial information for smoother local transitions.
- Uses a robust upper-mid luminance reference rather than relying only on the whole-frame average, improving recovery in mixed-light interiors.
- Increased the available local shadow/midtone recovery while retaining smooth regional gates and deep-black protection.
- Added a local texture guard to reduce flattening around darker furniture edges and natural detail.
- Refined the highlight shoulder with a gradual roll-off for bright interior surfaces.
- Preserves RGB relationships during luminance adjustment to reduce colour shifts and channel clipping.
- Updated the Auto Enhance completion message and app version to V0.36.0.

## Preservation
- Built directly on the V0.35.0 release.
- Existing CR2/RAW import and preview-decoding path unchanged.
- Original photo blobs, edited copies, jobs, clients, quotes, invoices, package catalogue and calendar data are preserved.
- No localStorage keys, IndexedDB schema, photo object store or Supabase schema changes.
- No reset, destructive migration or data rewrite.

## Limitations
- Local exposure analysis remains luminance-based; it does not semantically identify windows, walls, furniture or cabinetry.
- Highlight roll-off cannot reconstruct detail that is genuinely clipped in the source.
- This is not a new sensor-level RAW developer or AI-powered window replacement system.

## Validation
- Inline JavaScript syntax checks performed.
- ZIP archive integrity checked.
- Not browser-tested against a live PC/CR2 workflow in this environment. Compare the same reference RAW file and inspect full-resolution exports before client delivery.

## Installation
Extract the ZIP and upload its contents into the existing GitHub repository root, replacing matching files. Keep the previous release ZIP as rollback. Do not clear browser data.
