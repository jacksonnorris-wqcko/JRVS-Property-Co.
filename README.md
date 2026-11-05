# JRVS Property Co. — V0.6.1

## Photo workspace styling correction

- Corrected the previous release's stylesheet placement: the photo workspace CSS is now in the actual document head, not inside a later template string.
- Selection summary and Select all / Clear / Download selected controls are grouped into one compact horizontal toolbar.
- Batch editing remains a separate, collapsible full-width row.
- Only photo cards appear in the photo-card grid, aligned from the left with consistent widths and spacing.
- Mobile layouts stack the selection controls and photo cards appropriately.
- Retains original/edited filtering, individual full-resolution downloads, ZIP export, batch presets, cover selection and photo editing.
- No intentional changes to local business data, IndexedDB photo records or Supabase data.

## Deploying
1. Extract this ZIP.
2. Upload all files and folders inside it to the root of the existing GitHub repository, replacing matching files.
3. Do not clear browser/site data or reset IndexedDB.

## Release version
- App version: `0.6.1`
- `version.json`: `0.6.1`
- Service-worker cache: `jrvs-property-co-v0.6.1`
