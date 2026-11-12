# V0.57.0 Release Notes

## Photo Studio — Phase 3 gradient masking and local adjustments

- Added editable linear-gradient and radial/elliptical-gradient masks. Drag on the image to position the fade direction or radial centre and radius.
- Added on-canvas gradient shape guides and a selected-mask overlay.
- Combined gradient masks with existing brush paint/erase strokes, inversion, enabled state and recipe-backed undo/redo.
- Added local contrast, whites and blacks controls alongside exposure, highlights, shadows, temperature and saturation.
- Extended recipe normalisation with bounded gradient geometry and tonal values. Existing brush masks and older edit recipes remain compatible.
- Kept local mask rendering in the shared preview and full-resolution export pipeline.

## Compatibility and limitations

- No database migration. Original photo bytes, photo IDs, job links, saved edited copies and existing recipe history remain unchanged.
- Gradient and brush selections are manually placed. Automatic window, sky, wall, floor or object recognition is not included in this milestone.
- Semantic/AI selections, edge-aware refinement, GPU mask rendering and full float/wide-gamut processing remain future work.
- Windows CI validates source checks and packaging; actual EOS 600D CR2 output and in-app interaction still require user testing.
