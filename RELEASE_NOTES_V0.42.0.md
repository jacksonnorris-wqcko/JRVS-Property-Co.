# JRVS Property Co. — V0.42.0

## Rental Auto Enhance: mixed-light balancing

- Improves adaptive recovery in darker adjoining rooms while retaining safeguards for deep blacks, texture and already-bright surfaces.
- Applies an earlier, stronger highlight shoulder to reduce harsh white areas and preserve tonal gradation where source detail remains available.
- Makes global exposure more cautious when upper highlights are already near clipping, reducing the tendency to brighten the whole frame to fix a dark room.
- Keeps the RAW development workflow and existing non-destructive editor controls intact.

## Compatibility

- No database schema, local storage key, photo record, job, client or business workflow changes.
- Original source photos remain untouched; edits continue to save as separate copies.
- This is tonal balancing, not semantic object recognition. Detail already clipped in the source RAW/JPEG cannot be recreated.

## Test

1. Deploy the ZIP contents to the existing GitHub repository root.
2. Confirm the app reports version 0.42.0 after the service-worker update.
3. Develop the same Canon EOS 600D RAW file, then run Rental Auto Enhance.
4. Compare the adjoining living room, island benchtop and bright kitchen cabinetry against V0.41.2.
5. Check that shadow recovery does not create grey blacks, halos or a flat HDR appearance.
