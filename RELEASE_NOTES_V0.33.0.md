# JRVS V0.33.0 — Rental-aware Auto Enhance

## Photo Studio
- Refined the one-click Rental Auto Enhance analysis and tonal processing.
- Increased the low-resolution spatial luminance field from 72 to 96 samples wide for more detailed room-level balancing.
- Reworked local exposure correction with regional deficit gating, midtone targeting and deeper-black protection.
- Added a smoother highlight shoulder to protect bright cabinetry, walls and windows while retaining natural colour relationships.
- Reduced broad shadow lifting to help preserve contrast in dark furniture and living areas.
- Kept the single-click workflow: the engine analyses each photo and applies its own restrained corrections.

## Preservation
- Built directly from V0.32.0.
- No changes to photo records, jobs, clients, quotes, invoices, localStorage keys, IndexedDB stores or Supabase schema.
- RAW import/development path and original-photo preservation are unchanged.
- APP_VERSION, version.json and service-worker cache updated to 0.33.0.
- Archive contains only this release's release notes.

## Validation
- JavaScript syntax check and ZIP integrity check performed.
- Not live-tested in a browser against the user's full-resolution RAW workflow. Please compare the same CR2 and review highlights, dark rooms and colour before saving.
