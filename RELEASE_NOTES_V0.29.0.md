# JRVS V0.29.0 — Local Exposure Balancing

## Added
- Spatial luminance analysis divides the preview into a grid of regions.
- A blurred low-resolution luminance field guides smooth regional exposure correction.
- Darker room regions receive a restrained local lift, with pixel-level protection for bright windows and white surfaces.
- Global Auto Enhance corrections are now more conservative; regional shadow recovery is handled separately.
- Histogram is recalculated after local balancing.
- Local-balance state is retained in undo/redo history and versioned edit recipes.

## Compatibility
- Edit recipe schema advanced to version 2.
- Existing schema-version-1 recipes remain supported.
- No database/schema changes; no localStorage keys or IndexedDB stores are cleared or recreated.
- Existing originals, edited copies, jobs and business records are preserved.

## Limitations
- The local mask is generated from spatial luminance statistics, not semantic object recognition.
- It cannot reliably distinguish a window from a white wall or a dark couch from a shadowed wall.
- This is not full HDR recovery: clipped source highlights cannot be reconstructed from a single exposure.
- Validate output on representative rental interiors before using for client delivery.
