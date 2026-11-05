# JRVS Property Co. — V0.6.3

## Photo deletion fix

- Fixed bulk edited-photo deletion to recognise the app's stored `Edited` type value (case-insensitive), so the bulk delete action enables for selected edited copies.
- The bulk-delete handler repeats the same safe type check before deleting.
- Original photos remain protected from bulk deletion.
- Improved individual photo deletion feedback and error handling.
- Existing photo storage, ZIP export, editing and cover handling are retained.

## Deploying
1. Extract this ZIP.
2. Upload all files and folders inside it to the root of the existing GitHub repository, replacing matching files.
3. Do not clear browser/site data or reset IndexedDB.

## Release version
- App version: `0.6.3`
- `version.json`: `0.6.3`
- Service-worker cache: `jrvs-property-co-v0.6.3`
