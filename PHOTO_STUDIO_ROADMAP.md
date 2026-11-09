# JRVS Photo Studio — V0.26.0 Workbench step

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
V0.26.0 is primarily a workbench/interface milestone. It does not claim to provide genuine RAW sensor development, local adjustment masks, advanced perspective correction, or content-aware object removal. Existing processing behaviour remains in place until those engines are implemented and validated.
