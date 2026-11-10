# JRVS Property Co. V0.44.0

## Photo editor
- Reworked adaptive local shadow recovery to avoid excessive attenuation from stacked confidence masks.
- Increased recovery in genuinely underexposed adjoining areas while retaining deep-black, midtone and highlight safeguards.
- Preserved the V0.42/V0.43 global exposure and highlight-compression behaviour.
- Updated enhancer status messaging and application/cache version identifiers.

## Compatibility
- No database schema changes.
- Existing photo records and original-image preservation remain unchanged.
- Third-party notices retained.
