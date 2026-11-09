# JRVS V0.34.1 — Multi-zone engine recovery

## Photo Studio
- Merged the V0.34 multi-zone rental tonal-processing block into the complete, intact V0.33 editor codebase.
- Increased spatial illumination analysis to a 128-sample-wide map with smoother regional estimation.
- Added regional shadow/midtone lifting with deep-black guards and a restrained global lift.
- Added a multi-stage highlight shoulder to better preserve gradation in bright architectural areas.
- Retained colour-ratio protection during luminance changes.
- Updated the Auto Enhance confirmation to identify V0.34.1.

## Recovery and preservation
- Restored and retained the complete editor drawing, retouch, compare, preset, export and save functions from V0.33.
- No changes to localStorage keys, IndexedDB stores, photo records, jobs, clients, quotes, invoices or Supabase schema.
- RAW import/development pipeline remains from V0.33 and originals remain untouched.
- APP_VERSION, version.json and service-worker cache updated to 0.34.1.
- ZIP includes only this release's release notes.

## Validation
- All inline JavaScript blocks passed Node syntax validation.
- Verified critical editor functions remain present.
- Verified ZIP integrity and version consistency.
- Not live-tested in a browser with full-resolution CR2 files.
