# JRVS Property Co. — V0.33.0

A browser-based property photography and business workflow app built for JRVS Property Co.

## Current release

**V0.33.0 — Adaptive Rental Tone Engine**

This release advances the rental-specific automatic correction workflow following the V0.25 non-destructive edit-recipe foundation.

### Photo Studio
- Image-first editing workspace with a large central preview and a scrollable control panel.
- Develop, Colour, Finish, Geometry, Export and Retouch workspaces.
- Collapsible quick light and quick colour adjustment groups.
- Property editing presets and a new rental-photography Auto Enhance analysis workflow.
- One-click Rental Auto Enhance automatically analyses each photo; users no longer select an editing style.
- New local exposure balancing builds a blurred low-resolution luminance field and applies restrained regional shadow lift.
- Bright pixels such as windows and white cabinetry receive highlight protection while darker room regions can be lifted independently.
- Local balancing state is included in edit history and versioned edit recipes; old schema-version-1 recipes remain readable.
- Samples image luminance percentiles, spatial brightness distribution, clipping, saturation and likely neutral surfaces.
- Estimates whether a photo is a bright interior, low-light interior, bright neutral room, exterior or mixed-light scene, then applies restrained global corrections.
- Displays a brief analysis summary including scene estimate, mixed-lighting indication and estimated white-balance confidence.
- Image sampling estimates tonal percentiles, shadow/highlight distribution, clipping, saturation and likely neutral-surface colour cast before applying restrained starting adjustments.
- Auto Enhance uses deterministic local image analysis and a spatial luminance field. It is not semantic AI, precise object segmentation or a dedicated window mask; review results and refine manually.
- Live histogram, zoom-to-fit controls and before/after comparison.
- Undo/redo, crop and rotation controls.
- Existing manual clone/soft sampled-patch retouch tools.
- Save edited copies separately from original photo records.

### Editing recipe foundation
- Newly saved edited copies can store a versioned edit recipe alongside the rendered output.
- Recipe data includes supported global adjustment values, crop, rotation, preset and retouch stroke groups.
- Reopening a compatible edited copy can restore its recipe against its linked original source.
- Older edited photos without a recipe remain supported as flattened images.

### Photo library and RAW import
- Photo gallery supports project-based browsing, original/edited filtering, selection, downloads and deletion actions.
- Original photo records are retained separately from edited copies.
- CR2 import support uses the app's existing RAW decoding path and local preview workflow.
- Important: the current editor's CR2 workflow must not be described as a fully parametric RAW development experience. Confirm the actual decoder and camera-file behaviour on the target device before relying on RAW processing for paid delivery.

### Business workflow
- Existing jobs, clients, quotes, invoices and other business records remain part of the app.
- Existing browser storage and photo database are retained by this release.

## Known limitations and next development steps

V0.33.0 is a foundation and workbench milestone, not yet a Lightroom/Photoshop replacement.

The following are planned but are **not complete features**:
- Genuine professional RAW development with validated camera profiles and full sensor-level adjustment workflow.
- Local adjustment masks and selective brush-based exposure/colour edits.
- Professional window balancing and interior/exterior blending.
- Precision architectural perspective and lens-profile correction.
- A true healing algorithm and content-aware object removal.
- Advanced noise reduction, sharpening and colour management.

The current retouch Heal mode is a soft sampled patch, not content-aware healing. Perspective controls are currently lightweight and should not be represented as precision architectural correction.

## Data safety

- Keep a copy of the previous working release before deploying an update.
- Do not clear browser/site data as a routine update step.
- Do not delete the `jrvs-data` or `jrvs-calendar` localStorage records.
- The photo library uses IndexedDB database `jrvs-photo-library` and object store `photos`; do not delete or recreate it during normal upgrades.
- Keep original photo files. Edited images are separate derived records.
- This release does not require a new Supabase schema.

## Deploying to GitHub Pages

1. Download and extract the release ZIP.
2. Upload the **contents** of the extracted folder into the root of the existing GitHub repository.
3. Replace matching app files when prompted; do not upload the ZIP as a nested folder.
4. Commit the changes and allow GitHub Pages to publish.
5. Open the app and use its update check/refresh workflow if it does not pick up the new version automatically.

Do not clear site data to force an update; that risks removing locally stored app data and photos.

## Release metadata

- App version: `0.33.0`
- `version.json`: `0.33.0`
- Service-worker cache: `jrvs-property-co-v0.33.0`

## Project direction

JRVS Photo Studio is being developed towards a PC-first property photography editor. The intended direction is a visual, image-led workflow with professional development, selective local adjustments, architectural correction, retouching and reliable high-resolution delivery.


### V0.33.0 — Adaptive Rental Tone Engine
- Reworked local exposure balancing with a higher-resolution, softly blurred spatial luminance field.
- Added stronger adaptive shadow/midtone recovery with region-aware lift and per-pixel highlight protection.
- Added a gentle global rental midtone lift and a soft highlight shoulder to reduce abrupt clipping.
- Increased automatic analysis target brightness while retaining highlight-aware exposure limits.
- No AI service or external image upload; processing remains in-browser.


### V0.33.0 — Colour Integrity & Luminance-Based Exposure
- Local exposure lift and highlight roll-off now adjust luminance rather than independently multiplying RGB channels.
- Gamut-aware chroma compression reduces colour clipping and hue shifts in saturated objects during shadow recovery.
- Preserves the V0.30 adaptive local rental exposure workflow.
- ZIP packaging now includes only the current release's release-notes file.


### V0.33.0 — JRVS Photography Package Catalogue
- Seeds JRVS Essential, Standard, Plus and Complete introductory photography packages, with full package inclusions.
- Adds five optional extras and service-area/delivery notes.
- Default JRVS package descriptions are retained as a standard catalogue; only their catalogue prices are editable.
- Existing custom packages remain editable. Seeded catalogue additions are non-destructive and do not overwrite existing prices.
- Packages are available as reusable line items in quote creation.


### V0.33.0 — Rental-aware tonal engine
- Refined single-click Rental Auto Enhance with adaptive room-level exposure balancing.
- Increased spatial luminance analysis resolution and softened the regional luminance field.
- Added stronger highlight shoulder and protection for bright cabinetry/windows.
- Reduced broad shadow lifting and added deeper-black protection to avoid a grey/flat result.
- Tonal adjustments preserve RGB relationships to reduce colour shifts and channel clipping.
- Existing editing controls, RAW import/development, photos, jobs and user data remain unchanged.
