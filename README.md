# JRVS Property Co. — V0.5.8

## Photo workspace redesign

- Reorganised the project photo gallery into a cleaner, more spacious layout.
- Moved selection actions into a dedicated selection bar.
- Kept multi-select ZIP export as the primary delivery action.
- Moved batch preset editing into a collapsible section so it no longer competes with photo selection and export.
- Improved photo card proportions, spacing, filenames, status controls and action buttons.
- Added responsive layouts for tablet and mobile screens.
- Preserved the existing photo storage, full-resolution download and ZIP export logic.

## Deploying

1. Extract this ZIP.
2. Upload **all files and folders inside it** to the root of the existing GitHub repository.
3. Replace matching files when prompted.
4. Do not delete browser/site data or reset IndexedDB. Existing business records and photo-library data are stored locally and should be preserved.

## Release version

- App version: `0.5.8`
- `version.json`: `0.5.8`
- Service-worker cache: `jrvs-property-co-v0.5.8`

## Important

This release changes the photo workspace presentation and layout. It does not intentionally migrate, clear, or reset local photo records, business data, or Supabase data.
