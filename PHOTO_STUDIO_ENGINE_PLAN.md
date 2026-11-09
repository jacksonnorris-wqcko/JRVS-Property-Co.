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

V0.33.0 adds rental-specific global Auto Enhance analysis profiles; it is not yet local masking, semantic window detection or genuine RAW sensor development.

V0.33.0 adds deterministic local rental image analysis and automatic global correction; no AI service, external upload or per-image cloud fee is used.

V0.33.0 adds a deterministic local luminance-field correction stage after global tone adjustments and before retouch rendering. The field is spatially blurred and interpolated; bright pixels are protected. Recipe schema v2 persists the enable flag while maintaining schema v1 compatibility.

V0.33.0: adaptive rental tone stage uses a blurred 72-column luminance field, regional deficit weighting, pixel shadow/highlight guards, restrained midtone lift and soft highlight shoulder. Deterministic in-browser processing; no AI service.

V0.33.0: local exposure and highlight shoulder are applied to luminance; chroma is compressed only as needed to remain in RGB gamut. This avoids independent channel clipping that can distort saturated colours. Not a full colour-managed RAW pipeline.

V0.33.0 adds a non-destructive seed catalogue for JRVS service packages and optional extras in data.packages. Seed keys prevent duplicate insertion; matching existing entries and their prices are retained. Default descriptions are locked in the package editor while prices remain editable. Quote creation consumes the same data.packages entries; saved quotes are not rewritten.


### V0.33.0 — Rental-aware tonal engine
- Refined single-click Rental Auto Enhance with adaptive room-level exposure balancing.
- Increased spatial luminance analysis resolution and softened the regional luminance field.
- Added stronger highlight shoulder and protection for bright cabinetry/windows.
- Reduced broad shadow lifting and added deeper-black protection to avoid a grey/flat result.
- Tonal adjustments preserve RGB relationships to reduce colour shifts and channel clipping.
- Existing editing controls, RAW import/development, photos, jobs and user data remain unchanged.
