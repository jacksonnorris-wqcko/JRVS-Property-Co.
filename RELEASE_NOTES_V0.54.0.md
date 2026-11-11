# JRVS Property Co. Desktop — V0.54.0 Release Notes

## Photo Studio · Local adjustment masks
- Added a dedicated Masks workspace with up to 12 independent brush masks per photo.
- Paint and erase strokes with adjustable brush size, flow and soft-edge feathering.
- Adjust exposure, highlights, shadows, temperature and saturation independently for each mask.
- Enable, disable and invert masks, select individual masks, clear strokes or delete a mask.
- Added a live brush outline and a selected-mask overlay to help target local adjustments.
- Mask data is saved non-destructively in recipe schema v5 and participates in undo/redo.
- Existing recipes using schemas v1–v4 remain supported.
- The same mask stage is used for live preview and full-resolution export. Originals remain unchanged.

## Photo Studio · Architectural geometry
- Replaced the previous affine shear approximation with projective keystone correction for vertical and horizontal architectural lines.
- Added manual radial lens-distortion correction and a one-click geometry reset.
- Geometry is processed by the shared renderer for preview and full-resolution export.
- Neutral geometry retains the original centre-crop behaviour.
- Lens correction is manual; automatic camera/lens profile calibration is not included.

## Photo Studio · Clone and Heal
- Separated the Clone and Heal retouch operations.
- Clone copies pixels from the sampled source region.
- Heal uses sampled texture with local source/destination colour and luminance matching, plus feathered blending for small spot repairs.
- Retouch strokes remain non-destructive and are stored in edit recipes/history.
- Heal is sampled patch correction, not AI or content-aware object reconstruction.

## Preserved editing foundation
- Retains locally bundled FlashRaw 0.1.0, tone curve, eight-band HSL, JRVS Property Finish and Smart Finish.
- Original photos and RAW source bytes remain untouched; edits are separate outputs with recipes.
- Batch presets isolate per-photo mask settings and preserve the active editor state when complete.

## Important capability notes
- Masks are manually painted; there is no semantic window, room, sky or object selection.
- Lens correction has no automatic camera profile.
- Healing is not generative or content-aware.
- Rendering remains an 8-bit sRGB canvas workflow; high-bit-depth linear RAW and wide-gamut colour management are future work.
- EOS 600D CR2 compatibility, image-quality tuning and offline behaviour still need validation with the user's camera files on the target Windows PC.
