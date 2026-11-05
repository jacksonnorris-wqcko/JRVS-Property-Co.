# JRVS Property Co. — V0.6.2

## Bulk delete edited photos

- Added a **Delete selected edits** action beside the multi-photo selection and ZIP export controls.
- Select multiple edited copies and delete them together after a confirmation prompt.
- Bulk deletion is restricted to edited copies. Original photos are protected; the action remains disabled unless every selected photo is an edited copy.
- If a deleted edited copy was a project cover, the app assigns an available remaining project photo as the cover.
- Selection clears and the gallery refreshes after deletion.
- Existing single-photo deletion remains available.
- No changes to photo import, ZIP export, editing, local business data or Supabase schema.

## Deploying

1. Extract this ZIP.
2. Upload all files and folders inside it to the root of the existing GitHub repository, replacing matching files.
3. Do not clear browser/site data or reset IndexedDB.

## Release version
- App version: `0.6.2`
- `version.json`: `0.6.2`
- Service-worker cache: `jrvs-property-co-v0.6.2`
