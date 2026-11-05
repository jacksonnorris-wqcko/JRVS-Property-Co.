# JRVS Property Co. — V0.10.0

## Photo Studio viewport and workstation upgrade

- Fixed preview sizing with a real fit-to-viewport calculation based on the canvas and visible stage dimensions.
- Entire photographs now fit inside the available editor stage while preserving aspect ratio.
- Recalculates image fit when the stage resizes, including window and responsive layout changes.
- Zoom scales from the fitted image size, with fit-to-image reset and controlled zoom limits.
- Prevents clipping caused by intrinsic canvas dimensions and unresolved percentage max-height constraints.
- Refined desktop and mobile editor layout constraints.
- Existing originals, edited copies, localStorage data, IndexedDB photo records and Supabase schema remain untouched.

## Deploying
1. Extract this ZIP.
2. Upload all files and folders inside it to the root of the existing GitHub repository, replacing matching files.
3. Keep the same browser profile and existing app URL. Do not clear site data or reset IndexedDB.

## Release version
- App version: `0.10.0`
- `version.json`: `0.10.0`
- Service-worker cache: `jrvs-property-co-v0.10.0`
