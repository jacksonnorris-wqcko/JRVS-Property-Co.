# JRVS Property Co. — V0.12.0

## Photo Studio Retouch Studio
- Added a dedicated Retouch workspace with Clone, Heal and Move modes.
- Alt-click or first click selects a clean sample point; paint over the unwanted area to copy from that sample.
- Brush size, opacity and edge softness controls.
- Clone and soft-edge Heal patch rendering are applied non-destructively to editor output and full-resolution export.
- Added per-session undo and clear-retouch actions.
- Existing V0.11.0 navigation, editor adjustments, compare, export, localStorage, IndexedDB photo library and Supabase schema are retained.

### Retouch notes
- Clone copies from the sampled location.
- Heal uses a soft-edged sampled patch. It is manual spot repair, not content-aware AI object reconstruction.
- Retouch strokes are session-based; saved edited copies retain the rendered pixels. Reopening a saved copy starts a fresh edit session.

## Deploying
1. Extract this ZIP.
2. Upload all files and folders inside it to the root of the existing GitHub repository, replacing matching files.
3. Keep your existing browser profile and app URL. Do not clear site data.

## Release version
- App version: `0.12.0`
- `version.json`: `0.12.0`
- Service-worker cache: `jrvs-property-co-v0.12.0`
