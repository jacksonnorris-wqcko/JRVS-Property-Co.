# JRVS Property Co. — V0.38.0 Release Notes

## Rental Auto Enhance: interior detail and colour refinement

- Adds a restrained multi-scale local-contrast pass to improve definition and tonal separation in interior midtones.
- Protects deep shadows and near-white surfaces from excessive local-contrast amplification.
- Tightens the neutral-pixel sample used for automatic white-balance estimation.
- Applies confidence-scaled, capped temperature/tint corrections to reduce the chance of a coloured room driving an excessive correction.
- Retains V0.37 region-aware highlight compression, adaptive interior shadow recovery and original-preserving edit workflow.

## Preservation
- Built directly on V0.37.0.
- Existing CR2/RAW import and preview-decoding path unchanged.
- Original photo blobs, edited copies, jobs, clients, quotes, invoices, package catalogue, calendar and photo records preserved.
- No localStorage keys, IndexedDB schema, photo object store or Supabase schema changes.
- No reset, destructive migration or data rewrite.

## Limitations
- Local contrast is luminance-based, not semantic object recognition.
- Neutral colour estimation is conservative and may be less reliable under mixed lighting or where neutral surfaces are scarce.
- Detail clipped in all RAW channels cannot be recreated.
- This is not AI window replacement, a bracketed HDR merge or a new sensor-level RAW developer.

## Validation
- Inline JavaScript syntax checks performed.
- ZIP archive integrity checked.
- Not browser-tested against a live PC/CR2 workflow in this environment. Compare the same reference RAW file and inspect full-resolution exports before client delivery.

## Installation
Extract the ZIP and upload its contents into the existing GitHub repository root, replacing matching files. Keep V0.37.0 as rollback. Do not clear browser data.
