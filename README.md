# JRVS Property Co. — V0.14.0

## Retouch engine refinement

- Rebuilt brush coordinate mapping using the displayed canvas bounds, so brush placement remains aligned at fit and zoom sizes.
- Added interpolated brush dabs with spacing based on brush radius to reduce gaps during faster strokes.
- Changed pointer movement to collect brush dabs and schedule preview renders with requestAnimationFrame rather than synchronously rendering for every pointer event.
- Retouch undo now removes one complete stroke at a time.
- Clone sampling keeps a fixed source offset for a continuous stroke.
- Sample patches outside the image boundary are safely skipped.
- Retouching remains non-destructive relative to the original photo; saving creates a separate edited photo record with rendered pixels.
- The Heal control is explicitly described as soft sampled patch repair, not content-aware AI reconstruction.
- Existing photo records, localStorage, IndexedDB structure and Supabase schema are unchanged.

## Deploying
1. Extract this ZIP.
2. Upload all files and folders inside it to the root of the existing GitHub repository, replacing matching files.
3. Keep the existing browser profile and app URL. Do not clear site data.

## Release version
- App version: `0.14.0`
- `version.json`: `0.14.0`
- Service-worker cache: `jrvs-property-co-v0.14.0`
