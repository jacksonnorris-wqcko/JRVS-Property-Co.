# JRVS Property Co. V0.1.6
Photo Editing Toolkit Upgrade.

Added:
- Auto Enhance using image luminance analysis to suggest brightness, contrast, highlight and shadow adjustments.
- Property presets: Natural Property, Bright Interior, Warm & Welcoming, Exterior Clarity.
- Perspective correction controls using a lightweight affine skew transform (not a full architectural projective transform).
- Batch editing: apply the current settings to other original photos in the same job; creates separate edited copies and never overwrites originals.
- Export profiles: Agency high-quality JPEG, Web balanced JPEG, Maximum-quality JPEG, PNG.
- Experimental exposure-fusion HDR-style merge for 2–5 bracketed images selected from local files.
- RAW file preservation/import for common camera RAW extensions (CR2/CR3/NEF/ARW/DNG/RAF/ORF/RW2/PEF/SRW). Browser-native RAW decoding is not included yet; RAW originals are safely stored but must be converted to JPEG for in-app editing.

Existing localStorage and IndexedDB storage keys are preserved. No migration or reset.
Based on V0.1.5.8.
