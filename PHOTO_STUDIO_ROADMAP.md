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
