# JRVS V0.28.0 — Automatic Rental Auto Enhance

## Changed
- Removed the manual rental profile selector.
- Replaced it with one-click automatic per-image analysis.
- Analyses luminance percentiles, highlight clipping, shadow distribution, spatial brightness zones, saturation and likely neutral surfaces.
- Estimates broad scene conditions (bright interior, low-light interior, neutral room, exterior) and mixed lighting.
- Applies restrained global exposure, highlights, shadows, whites, blacks, contrast, vibrance and conservative white-balance corrections.
- Reports a short analysis summary after processing.

## Limitations
- This is locally coded deterministic image analysis, not AI or a trained scene-recognition model.
- It cannot reliably identify exact windows, walls, furniture or room objects.
- Mixed-lighting detection is statistical and does not create local masks; bright windows and dark rooms still receive global corrections.
- The editor's current CR2 workflow remains based on its existing RAW preview/decode path, not a newly implemented professional sensor-level RAW development engine.
- Auto Enhance is a starting correction. Review each image before delivery.

## Compatibility and data
- Built from V0.27.0.
- No database/schema changes.
- No localStorage keys, IndexedDB databases or object stores are cleared or recreated.
- Original files, edited copies, jobs and business records are retained.
