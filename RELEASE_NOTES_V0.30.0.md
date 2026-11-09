# JRVS V0.30.0 — Adaptive Rental Tone Engine

## Changes
- Reworked local exposure balancing around a 72-column blurred spatial luminance field.
- Dark regions receive a stronger adaptive lift, weighted by both local regional deficit and pixel-level shadow values.
- Bright pixels are protected from shadow recovery.
- Added a restrained global midtone lift to reduce the under-bright appearance seen in V0.29.0.
- Added a soft highlight shoulder to roll near-white values toward white more gradually.
- Raised the automatic analysis target median and adjusted highlight-aware exposure limits.
- Retained one-click operation; no manual style/profile choice.

## Compatibility and preservation
- Built from V0.29.0.
- No storage schema changes, localStorage key changes, IndexedDB database/store changes or data clearing.
- Existing originals, edited copies, jobs and business records remain untouched.
- Existing recipe schema v1 and v2 compatibility retained.
- APP_VERSION, version.json, service worker cache and documentation updated to 0.30.0.

## Limitations
- This remains deterministic pixel/luminance analysis, not semantic AI segmentation.
- It cannot identify exact window boundaries or reconstruct clipped RAW highlights.
- Stronger local lift can reveal noise in very dark source areas; inspect at 100% before delivery.
- No live browser test was performed in this build environment. Compare against the supplied benchmark before production use.
