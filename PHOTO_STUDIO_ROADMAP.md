# JRVS Photo Studio — V0.34.1 Workbench step

## Delivered
- Reworked the editor's right-hand control panel into a tighter, image-first workspace.
- Renamed the Light workspace to Develop and Detail to Finish.
- Grouped primary exposure controls into a collapsible Quick light adjustments section.
- Grouped colour controls into a separate collapsible section.
- Removed the duplicated Exposure control from the tonal section.
- Reduced control density, improved panel scrolling, and kept the image stage dominant.
- Preserved the existing editor processing, recipes, photo storage, RAW import path, job data and update flow.

## Architecture direction
The next engineering milestones should be delivered as separate, testable layers:
1. Develop engine: deterministic adjustment graph, preview/full-resolution parity, colour handling.
2. RAW: integrate a genuine CR2 decoder (not embedded JPEG preview extraction) and test against actual camera files.
3. Local adjustments: mask model, brush UI, feathering and per-mask adjustment parameters.
4. Geometry: proper perspective transform and lens correction.
5. Retouch: independent clone and healing algorithms; later content-aware reconstruction.

## Honest capability notes
V0.34.1 is primarily a workbench/interface milestone. It does not claim to provide genuine RAW sensor development, local adjustment masks, advanced perspective correction, or content-aware object removal. Existing processing behaviour remains in place until those engines are implemented and validated.


## V0.34.1 — Rental Auto Enhance
- Replaces the simple mean-brightness heuristic with sampled tonal analysis using luminance percentiles, shadow/highlight distribution, clipping estimates and colour statistics.
- Adds rental-specific profiles: natural interior, bright interior, kitchen/bathroom clean whites, exterior daylight and neutral correction.
- Uses restrained global corrections designed to preserve natural room colour and avoid heavily stylised HDR.
- This remains a global analysis-and-adjustment starting point. It does not yet identify windows/rooms with semantic AI or create local masks.


## V0.34.1 — Automatic Rental Auto Enhance
- Removed manual profile selection.
- Added per-image deterministic analysis of luminance percentiles, clipping, spatial brightness zones, saturation and likely neutral surfaces.
- Automatically chooses conservative global correction values and reports estimated scene/mixed-light conditions.
- This is not semantic AI and does not create window or object masks. A future local-mask engine is required for true selective window balancing.


## V0.34.1 — Local Exposure Balancing
- Added a low-resolution spatial luminance field with blur and interpolation to create smooth regional shadow lifts.
- Bright pixel protection prevents local shadow lift from significantly raising already bright window and cabinetry pixels.
- Auto Enhance uses more restrained global adjustments and enables local balance automatically.
- Recipe schema v2 stores the local-balance state; schema v1 remains supported.
- This is luminance-based masking, not semantic object/window detection.


## V0.34.1 — Adaptive Rental Tone Engine
- Increased local luminance field resolution and added stronger adaptive shadow/midtone recovery.
- Added restrained global midtone lift and soft highlight shoulder.
- Raised automatic target median with highlight-aware exposure limits.
- Still luminance-based; semantic window/object masks remain future work.


## V0.34.1 — Colour Integrity & Luminance-Based Exposure
- Local exposure recovery now remaps luminance and uses gamut-aware chroma compression instead of independent RGB channel scaling.
- Designed to reduce saturated red clipping and hue shifts while retaining adaptive local shadow recovery.


## V0.34.1 — JRVS Photography Package Catalogue
- Added four reusable JRVS introductory photo packages and five optional extras with detailed inclusions.
- Added service-area, delivery and travel notes to the package workspace.
- Default package names and inclusions are fixed while catalogue prices remain editable.
- Existing custom packages and quote history are preserved; missing defaults are added without overwriting matching packages.


### V0.34.1 — Rental-aware tonal engine
- Refined single-click Rental Auto Enhance with adaptive room-level exposure balancing.
- Increased spatial luminance analysis resolution and softened the regional luminance field.
- Added stronger highlight shoulder and protection for bright cabinetry/windows.
- Reduced broad shadow lifting and added deeper-black protection to avoid a grey/flat result.
- Tonal adjustments preserve RGB relationships to reduce colour shifts and channel clipping.
- Existing editing controls, RAW import/development, photos, jobs and user data remain unchanged.


## V0.40.0 — Natural tonal balance refinement
- Reduced adaptive shadow recovery and the global shadow lift floor to retain natural dark-room depth.
- Relaxed highlight compression and moved the shoulder transition higher so bright whites remain bright while retaining a gentle roll-off.
- Increased restrained midtone detail separation and refined automatic contrast/white recommendations.
- Preserved existing storage, recipe, import and RAW preview paths.


## V0.41.0 — Experimental native RAW development
- Integrates FlashRaw WebAssembly for real sensor-data decoding and sRGB development of supported CR2/RAW files.
- Full-resolution RAW decode is performed when opening a RAW source in Photo Studio; import previews use half-size RAW development.
- Embedded JPEG fallback remains available and is explicitly labelled when used.
- Requires first-use network access to load the decoder from esm.sh; service worker caches successful CDN responses where supported.
- Next: validate with the user's EOS 600D CR2, tune demosaic/white balance/highlight handling, then connect RAW-linear processing to the JRVS tonal engine without double-applying camera rendering.

---

# JRVS Photo Studio — Phase 1 + Phase 2 foundation (desktop development)

## Implemented in the current development milestone

- Pin FlashRaw JavaScript package version `0.1.0` in the desktop app dependencies.
- Bundle the FlashRaw browser module and WASM runtime beside the generated desktop frontend; the app no longer imports its decoder from esm.sh at runtime.
- Use the FlashRaw browser entry point and request CPU SIMD, automatic demosaic, as-shot white balance and highlight reconstruction for sensor development.
- Keep embedded camera JPEG preview and true sensor-developed output distinguishable. Sensor-developed source state is recorded in recipe schema v4 so the original CR2 can be re-developed when an edit is reopened; fallback to the embedded preview is explicitly reported.
- Add a luminance tone curve with three adjustable tonal anchors (shadows, midtones and highlights). A shared 256-entry curve lookup table is used by the chart and render pipeline.
- Add an eight-band HSL mixer (red, orange, yellow, green, aqua, blue, purple and magenta), each with hue, saturation and luminance controls.
- Persist tone curve and HSL values in recipe schema v4 while accepting legacy recipe schemas v1–v3. Include the settings in undo/redo history and isolate them from unrelated batch preset application.
- Add an automated Photo Studio engine check for RGB/HSL round trips, default identity curve, monotonic adjusted curve, recipe compatibility and local RAW runtime wiring. The check is part of the Windows desktop CI workflow.

## Verification state and limits

- Source-level JavaScript syntax validation passed for all inline scripts before the final CI correction.
- The first Windows build exposed an incorrect assumed FlashRaw output filename (`index.js`). The npm package's browser entry point is `browser.js`; the desktop copy/check/import paths were corrected.
- **Awaiting:** the next Windows CI run after the corrected bundling path and Photo Studio regression check.
- **Not yet verified:** actual Canon EOS 600D CR2 files, offline RAW development in the installed Windows application, RAW colour fidelity/highlight recovery, performance on large files and full-resolution output parity.
- The tone curve is currently a three-anchor parametric luminance curve, not a freehand arbitrary point curve. HSL is an eight-range sRGB control, not a colour-managed wide-gamut workflow.
- The editor's current renderer still works with browser canvas 8-bit sRGB pixels. A later engine stage is required for high-bit-depth linear RAW processing and advanced colour management.

## Next engineering work

1. Get a clean Windows build with the decoder bundled locally.
2. Test with original EOS 600D CR2 files: preview, sensor development, close/reopen edited copy, save another edit, export, and repeat with network disabled.
3. Compare before/after and inspect clipping, white balance, colour and detail at 100% zoom; record camera model, file dimensions and observed decoder metadata.
4. Once RAW foundations are confirmed, develop the next control tier: proper RGB/parametric curve editing, split colour grading and more exact HSL selection, with recipe/history tests.
5. Profile the image pipeline and move expensive work to a worker/offscreen path before expanding to masks and larger RAW workloads.

---

# JRVS Photo Studio — Phase 3, Phase 4 and Phase 5 (V0.54.0 target)

## Phase 3 — Local adjustment masks
- Add independent brush masks with additive and subtractive strokes, feather/edge softness, flow and enabled/disabled state.
- Each mask holds its own local exposure, highlight, shadow, temperature and saturation adjustments.
- Store masks in versioned non-destructive recipes; preserve v1–v4 compatibility and include mask data in history/undo.
- Render masks in the same deterministic adjustment path for preview and full-resolution export.
- Masks are manual luminance/brush regions only; do not describe them as semantic room/window/object AI masks.

## Phase 4 — Architectural geometry and lens correction
- Replace the current affine shear approximation with a projective homography for vertical and horizontal keystone correction.
- Add a manual radial lens distortion correction control.
- Preserve rotation and crop dimensions; neutral geometry must be identical to the current source render.
- Share geometry mapping between preview and full-resolution output. Do not claim automatic lens-profile calibration.

## Phase 5 — Clone and healing retouch
- Preserve Clone source selection and brush/edge controls.
- Clone paints directly from the selected source region.
- Heal uses the sampled source's high-frequency detail with local destination/source colour and luminance matching, feathered at the brush edge.
- Keep strokes non-destructive and editable in recipes/history. This is sampled patch healing, not AI/content-aware reconstruction.

## V0.54.0 release acceptance
- Automated checks cover mask feathering and local-adjustment limits, projective geometry corner/identity mapping, radial lens neutral identity, distinct clone/heal blend behaviour, and legacy/current recipe compatibility.
- All inline app scripts parse; desktop prepare completes with local RAW assets; Windows CI compiles and verifies NSIS/MSI installers; signed updater publish succeeds using the existing updater key.
- No claim of EOS 600D CR2 validation or full camera-quality parity unless tested with the user's actual files.


---

# JRVS Photo Studio — V0.54.0 Phase 3–5 implementation

## Delivered in source
- **Local masks:** dedicated workspace, 12-mask limit, paint/erase strokes, brush size, flow, feather, enable/disable/invert, local exposure/highlights/shadows/temperature/saturation, overlay and live brush outline.
- **Recipe/history:** mask data stored in recipe schema v5, older v1–v4 remain supported, masks in undo/redo, restore-time bounds on count/strokes/dabs/adjustments.
- **Geometry:** projective homography, manual radial lens correction, shared preview/export render path, neutral crop identity. No automatic camera lens profile.
- **Retouch:** separate sampled Clone and colour/luminance-matched Heal, recipe-backed and non-destructive. No AI/content-aware reconstruction.
- **Batch safety:** per-photo masks/retouch isolated for generic presets; current editor state restored. Exact-look outputs preserve editable recipes.
- **Performance:** homography precomputed once per render, bounded radial sampling, clone skips heal-only mean sampling.

## V0.54.0 verification and limits
- Five inline application scripts parse without syntax errors.
- Direct helper checks passed for geometry identity/corners/inverse, radial bounds, mask feather/normalisation, and distinct Clone/Heal blends.
- Windows CI covers Phase 1–2 colour/curve and Phase 3–5 geometry/mask/retouch regression checks.
- The final Windows build, signed updater publication, installed app behaviour and real-camera tests must be recorded separately in `PROJECT_STATUS.md`.
- Masks remain manual; lens correction has no profile; Heal is not generative; rendering remains 8-bit sRGB; EOS 600D CR2 quality/offline behaviour and in-place upgrade require on-PC validation.


---

# JRVS Photo Studio — V0.56.0 Phase 2 processing-engine foundation

## Delivered in source
- FlashRaw upgraded from 0.1.0 to 0.2.0 and remains bundled locally with its WebAssembly assets.
- Full RAW develop now requests FlashRaw sensor-aware automatic demosaicing, 16-bit half-float linear RGB, as-shot white balance, highlight reconstruction, noise-aware edge handling and chromatic-aberration correction where supported.
- The linear RAW frame is retained as the editing source during the Photo Studio session. The embedded JPEG remains a preview/fallback only and is no longer the edited master after Develop RAW.
- Added half-float conversion and complete EXIF orientation mapping (1–8) to create preview and full-resolution source canvases from the retained sensor frame.
- Exposure for developed RAW is applied before linear-to-sRGB encoding; existing sRGB controls, local masks and retouch remain available in the established shared render path.
- Saved recipe schema v5 remains unchanged; reopening a RAW-developed edit re-develops the immutable source CR2 and then restores the existing recipe.

## Phase 2 known boundaries
- The output stage after linear RAW conversion is still an 8-bit sRGB canvas; some legacy controls, mask composition, geometry, retouch and final JPEG/PNG output still operate on that display-range image.
- Full float processing for every adjustment stage, wide-gamut editing/output, GPU compute, camera-profile management and end-to-end ICC export are not yet delivered.
- Actual EOS 600D colour, noise, detail, clipping and full-resolution quality must be checked with the user's CR2 files. CI validates logic and packaging, not camera-image fidelity.


---

# JRVS Photo Studio — Phase 3 expansion (V0.57.0)

## Implemented in the current candidate
- Extend the existing brush-mask model with manually placed linear-gradient and radial/elliptical-gradient selections.
- Drag directly on the image to set linear gradient direction/fade distance or radial centre and ellipse radii. Shape guides and selected-mask overlays are preview-only aids.
- Compose gradient geometry with existing additive/subtractive brush strokes, mask inversion, enable/disable and the 12-mask/500-stroke safety limits.
- Add local contrast, whites and blacks to the existing exposure, highlights, shadows, temperature and saturation controls.
- Persist type, gradient geometry, transition softness and local tonal values in the existing non-destructive recipe. Older recipes default to brush masks and remain readable; no database migration or destructive rewrite is required.
- Render masks through the shared preview/export compositor.

## Phase 3 remaining work
- Semantic selections for windows/glass, sky, walls, ceilings, floors and furniture.
- Edge-aware subject refinement, colour/luminance-range masks and AI-assisted region selection.
- GPU/worker-based mask rasterisation and full-resolution performance tuning after user testing on large EOS 600D RAW files.

## Honest capability boundary
V0.57.0 does not claim AI object detection or automatic property-part recognition. Linear and radial gradients are manual, deterministic geometry masks. Validate gradients, local corrections, save/reopen, batch isolation and export parity with actual rental photos before progressing to semantic selection.



---

# JRVS Photo Studio — Phase 3 tonal range refinement (V0.58.0)

## Implemented in the development candidate
- Add per-mask tonal range refinement: All tones, Shadows, Midtones or Highlights.
- Add adjustable softness around the tonal transition boundaries to avoid abrupt selections.
- Apply range weighting after the existing brush/linear/radial mask geometry and inversion, before the selected mask's local adjustments.
- Keep the feature deterministic and local; it works on the current rendered image's display-referred luminance and does not use an AI service or upload images.
- Bump recipe schema to v6. Recipes v1–v5 remain supported; older masks default to All tones. No database migration or original-photo rewrite is required.

## Remaining Phase 3 work
- Semantic selections for windows/glass, sky, walls, ceilings, floors and furniture.
- Colour-range selection and edge-aware refinement.
- AI-assisted region selection, subject boundary refinement and GPU/worker-based mask rendering after real-photo testing.

## Honest capability boundary
Tonal range refinement narrows an existing manual mask by brightness; it does not discover an object or region. It currently operates on the display-referred sRGB render stage, not a full float/wide-gamut RAW adjustment graph. Validate tone-range transitions on real property images and confirm recipe save/reopen, batch isolation and preview/export parity before progressing to semantic selection.
