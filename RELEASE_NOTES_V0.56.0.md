# JRVS Property Co. Desktop — V0.56.0 Release Notes

## Photo Studio 2.0 · Phase 2 processing-engine foundation
- Upgraded the locally bundled FlashRaw RAW decoder to V0.2.0.
- Full sensor development now requests sensor-aware automatic demosaicing, as-shot white balance, highlight reconstruction, edge-aware noise handling and lateral chromatic-aberration correction where the camera sensor supports it.
- Added a retained 16-bit half-float linear RGB RAW working source. Photo Studio no longer makes a JPEG the editing master after the user selects Develop RAW.
- Added correct EXIF orientation mapping for all eight RAW orientations, half-float conversion and a high-quality display preview generated directly from the retained linear frame.
- Exposure is applied in linear light before sRGB display conversion for developed RAW sources. Preview and full-resolution export use the same retained RAW source and render path.
- Reopening a saved RAW-developed edit re-develops the untouched original CR2 into the linear source and restores its existing edit recipe.
- Kept existing JPEG editing, embedded-preview fallback, recipe schema v5, masks, geometry, retouch, Property Finish, jobs and business data compatible.
- Original photo blobs and saved edit records are not rewritten; no database migration is required.

## Scope and verification
- CI regression coverage includes half-float conversion, all eight EXIF orientation transforms, linear decoder options, retained-source rendering, existing recipe compatibility and prior Photo Studio checks.
- The output remains an 8-bit sRGB display/export canvas after the linear RAW source-development stage; complete 16-bit float rendering for every adjustment, wide-gamut editing, GPU acceleration and camera-profile UI remain future engine work.
- Windows CI cannot establish image quality on a real Canon EOS 600D. Test actual CR2 files on the target PC, including reopened saved edits, full-resolution exports and an offline session.
