# JRVS V0.27.0 — Rental Auto Enhance

## Added
- Rental-focused Auto Enhance profile selector.
- Natural & balanced rental interior profile.
- Bright & airy rental interior profile.
- Kitchen & bathroom clean-whites profile.
- Rental exterior daylight profile.
- Neutral correction profile.
- Image sampling for luminance percentiles, shadow/highlight distribution, clipping estimates, saturation and likely neutral surfaces.
- Conservative estimated white-balance correction when enough neutral candidates are detected.
- Status readout with median luminance, highlight clipping estimate and whether neutral-surface white balance was checked.

## Important limitations
- Auto Enhance applies global adjustments only; it does not yet detect windows, walls or individual objects to create masks.
- It is a deterministic image-analysis workflow, not a generative AI system.
- Genuine CR2 sensor-data RAW development is not delivered by this release; the existing RAW preview workflow remains.
- Always review the result. Mixed lighting and strongly coloured interiors can confuse neutral-surface estimates.

## Compatibility
- Built from V0.26.0.
- No database/schema changes.
- No localStorage keys or IndexedDB stores are cleared or recreated.
- Existing original photos, edited copies, jobs and business records remain untouched.
