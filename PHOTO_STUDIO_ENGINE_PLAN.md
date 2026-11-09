# JRVS Photo Studio engine rebuild — technical plan

## V0.25.0 foundation delivered
- Introduces a versioned `editRecipe` object on newly saved edited-photo records.
- Recipe captures global adjustments, crop, rotation, preset and retouch stroke groups.
- Reopening a V0.25.0 edited copy resolves its `sourcePhotoId`, loads the untouched source and restores the recipe. The rendered JPEG remains available as the saved deliverable.
- Existing edited records without a recipe continue opening as flattened images.
- Original photo blobs and existing IndexedDB stores/keys are not migrated or deleted.

## Architecture target
1. Source layer: immutable original file, format/metadata inspection, RAW decoder adapter.
2. Development layer: camera profile, demosaic, white balance, exposure, highlight recovery, colour transform, output to a wide-gamut working space where browser support permits.
3. Recipe layer: versioned, serialisable operations with deterministic ordering and migration support.
4. Render layer: low-resolution interactive preview and full-resolution export using the same operation graph; worker/offscreen acceleration where supported.
5. Local persistence: source ID + recipe + rendered derivative. Recipe edits never overwrite source bytes.
6. Retouch layer: independent masks/strokes and a proper healing implementation; clone and heal must be separate algorithms.
7. Delivery layer: export profile, colour space, dimensions, metadata policy and batch consistency.

## RAW development status
V0.25.0 does NOT implement genuine CR2 sensor-data development. The current CR2 path still uses the embedded camera JPEG preview. A real RAW decoder must be integrated and tested against the user's actual Canon files, including camera model, dimensions, colour, white balance, highlight handling and full-resolution export. Do not describe the current path as genuine RAW development.

## Safety and compatibility
- Keep V0.24.0 as rollback.
- Do not clear localStorage, IndexedDB, Supabase tables or user records.
- No database schema change is required for the recipe metadata in IndexedDB.
- Existing flattened edited JPEGs remain usable.

V0.27.0 adds rental-specific global Auto Enhance analysis profiles; it is not yet local masking, semantic window detection or genuine RAW sensor development.
