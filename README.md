# JRVS Property Co. — V0.6.0

## Photo gallery structural redesign

- Separated the project gallery controls from the photo-card grid in the rendered HTML structure.
- The gallery heading, selection/export bar and batch editing panel now occupy their own full-width rows.
- Only photo cards are rendered inside the dedicated responsive photo-card grid.
- This removes the previous grid auto-placement conflict that caused the selection and batch panels to appear as narrow empty cards beside photos.
- Kept multi-select ZIP export, batch presets, individual full-size downloads, editing, cover selection and workflow status controls.
- Preserved existing IndexedDB photo storage and application data.

## Deploying

1. Extract this ZIP.
2. Upload all files and folders inside it to the root of the existing GitHub repository.
3. Replace matching files when prompted.
4. Do not clear browser/site data or reset IndexedDB.

## Release version

- App version: `0.6.0`
- `version.json`: `0.6.0`
- Service-worker cache: `jrvs-property-co-v0.6.0`

This release changes the gallery DOM structure and presentation only. It does not intentionally migrate, clear, or reset business data, photo records, or Supabase data.
