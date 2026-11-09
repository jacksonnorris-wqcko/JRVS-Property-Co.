# JRVS V0.34.0 — Multi-zone Rental Development

## Photo Studio
- Increased spatial illumination analysis resolution from 96 to 128 samples wide, aspect-scaled.
- Added adaptive regional interior midtone recovery with deeper-black protection.
- Improved bright-region guarding and introduced a staged highlight shoulder for smoother tonal transitions.
- Retained luminance remapping and gamut-aware chroma compression to reduce colour shifts.
- Kept one-click Rental Auto Enhance; the app analyses each photo and applies restrained corrections automatically.

## Limitations
- Bright-region protection is luminance-based, not semantic window detection or an independent window mask.
- This cannot reconstruct detail already clipped in the source or replace genuine sensor-level RAW development.
- Review each result before delivery, especially mixed-light rooms and bright windows.

## Preservation
- Built directly from V0.33.0; V0.24.0 remains the designated rollback baseline.
- No changes to photo records, jobs, clients, quotes, invoices, localStorage keys, IndexedDB stores or Supabase schema.
- Original photo blobs remain untouched; existing editing recipes remain compatible.
- RAW import/development path is unchanged.
- APP_VERSION, version.json and service-worker cache updated to 0.34.0.
- This ZIP contains only V0.34.0 release notes.

## Validation
- JavaScript syntax, version consistency and ZIP integrity checks performed.
- Not live-tested in a browser against the user's complete CR2 workflow.
