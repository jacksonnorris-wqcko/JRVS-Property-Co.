# JRVS Property Co. — V0.5.9

## Photo workspace grid correction

- Fixed the project gallery layout so the gallery heading, photo selection/export bar, and collapsible batch-editing panel span the full gallery width.
- Photo cards now flow beneath the full-width controls instead of sharing the same grid row as narrow side panels.
- Kept the responsive stacked selection bar on smaller screens.
- Preserved V0.5.8 photo cards, ZIP export, individual full-resolution downloads, editing and existing photo storage.

## Deploying

1. Extract this ZIP.
2. Upload all files and folders inside it to the root of the existing GitHub repository.
3. Replace matching files when prompted.
4. Do not clear browser/site data or reset IndexedDB. Existing business records and photo-library data should be preserved.

## Release version

- App version: `0.5.9`
- `version.json`: `0.5.9`
- Service-worker cache: `jrvs-property-co-v0.5.9`

This release is a presentation/layout correction. It does not intentionally migrate, clear, or reset local business records, photo records, or Supabase data.
