# JRVS Property Co. — V0.37.0 Release Notes

## Photo Studio: adaptive bright-region management

- Builds on V0.36 multi-scale interior recovery.
- Adds a region-aware highlight shoulder: broad bright regions receive graduated compression while isolated bright details in darker rooms are treated more gently.
- Strengthens Auto Enhance highlight estimation for high-percentile brightness and scenes with more near-clipped pixels.
- Retains shadow colour, deep-black and local texture safeguards.
- Updates Auto Enhance completion message and app version to V0.37.0.

## Preservation
- Built directly on V0.36.0.
- Existing CR2/RAW import and preview-decoding path unchanged.
- Original photo blobs, edited copies, jobs, clients, quotes, invoices, package catalogue, calendar and photo records preserved.
- No localStorage keys, IndexedDB schema, photo object store or Supabase schema changes.
- No reset, destructive migration or data rewrite.

## Limitations
- Highlight control is based on luminance distribution and regional brightness; it does not identify windows or cabinetry semantically.
- Detail clipped in all RAW channels cannot be recreated by tonal compression.
- This is not a new sensor-level RAW developer, AI window replacement or HDR bracket merger.

## Validation
- Inline JavaScript syntax checks performed.
- ZIP archive integrity checked.
- Not browser-tested against a live PC/CR2 workflow in this environment. Compare the same reference RAW file and inspect full-resolution exports before client delivery.

## Installation
Extract the ZIP and upload its contents into the existing GitHub repository root, replacing matching files. Keep V0.36.0 as rollback. Do not clear browser data.
