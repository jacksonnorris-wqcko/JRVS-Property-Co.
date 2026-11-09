# JRVS Property Co. — V0.35.0 Release Notes

## Photo Studio: adaptive room recovery

- Increased spatial sampling resolution for the local illumination field.
- Strengthened adaptive shadow recovery in darker interior regions.
- Added a regional darkness gate so recovery is concentrated in underexposed areas.
- Reduced the global shadow lift to limit washing out already-bright rooms.
- Applied an earlier, gentler highlight shoulder to help retain tonal separation in pale surfaces.
- Updated the Auto Enhance completion message and application version.

## Preservation

- Built directly on the complete V0.34.1 editor codebase.
- Original photo blobs remain unchanged; edits continue to save as separate copies.
- No changes to jobs, clients, quotes, invoices, photo database schema, localStorage keys or Supabase schema.
- CR2/RAW decoding path is unchanged.

## Validation

- Static source checks and JavaScript syntax checks performed.
- ZIP archive integrity checked.
- Not yet browser-tested against full-resolution CR2 files. Please compare the same reference photo before using for client delivery.

## Installation

Extract the ZIP and upload its contents into the existing GitHub repository root, replacing the previous app files. Do not delete browser data.
