# JRVS Property Co. — V0.43.0

## Rental Auto Enhance: stronger local room recovery

- Increases adaptive lift in underexposed adjoining rooms and darker interior midtones.
- Expands the shadow/midtone recovery window so dim rooms are less likely to remain muddy.
- Retains deep-black protection, local texture safeguards and the V0.42 highlight shoulder.
- Keeps global exposure restrained; the improvement is focused on spatial/local recovery rather than brightening the whole image.

## Compatibility

- No database schema, local storage key, photo record, job, client or business workflow changes.
- RAW development and non-destructive editing remain intact.
- Original source photos remain untouched; edits continue to save as separate copies.
- This remains luminance-based local balancing, not semantic room/window recognition. Detail clipped in the source cannot be recreated.

## Test

1. Deploy the ZIP contents to the existing GitHub repository root.
2. Confirm the app reports version 0.43.0 after the service-worker update.
3. Develop the same Canon EOS 600D RAW file, then run Rental Auto Enhance.
4. Compare the adjoining living room against V0.42.0 while checking kitchen highlights and island detail.
5. Watch for grey blacks, halos, noisy shadows or an artificial HDR appearance.
