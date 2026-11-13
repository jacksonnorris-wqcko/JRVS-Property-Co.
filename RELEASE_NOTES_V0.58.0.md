# V0.58.0 Release Notes

## Photo Studio
- Added per-mask tonal range refinement: All tones, Shadows, Midtones and Highlights.
- Added adjustable range softness so transitions between selected brightness ranges remain gradual.
- Range refinement composes with brush, linear-gradient and radial/elliptical-gradient masks, including mask inversion.
- Local adjustments are applied only to the portion of the selected mask that falls within the chosen luminance range.
- Updated the non-destructive edit recipe to schema v6. Recipe versions 1–5 remain supported; existing masks default to All tones.

## Compatibility and boundaries
- No database migration. Original photo bytes, photo IDs, job links, saved edited copies and existing business records remain unchanged.
- Tonal range refinement is deterministic and local. It narrows a manually created mask using display-referred luminance; it does not automatically detect windows, walls, floors, skies or other objects.
- The renderer still has an 8-bit sRGB stage. Full float/wide-gamut RAW editing, colour-range selection, edge-aware semantic selections and AI-assisted region selection remain future work.
- GitHub Actions run `43331735884` passed the handover check, Photo Studio regression suite, Windows EXE/MSI build, installer output verification and artifact upload. The subsequent signed-release workflow rebuilds this same application source and publishes the updater manifest after version and signing checks. Real EOS 600D CR2 quality, rental-photo interaction, save/reopen, batch isolation and preview/export parity still require testing in the installed application.
