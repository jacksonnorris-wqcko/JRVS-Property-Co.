# JRVS Property Co. Desktop — V0.55.0 Release Notes

## Photo Studio 2.0 · Phase 1 workstation redesign
- Rebuilt the editor around a three-zone workstation: dedicated workspace rail, image-first central stage and contextual right-hand inspector.
- Added direct canvas toolbar actions for local brush masks, sampled Clone and Heal, rotate and geometry reset.
- Added one-click Natural, Bright, Window-safe and Modern quick looks while retaining the full existing preset selector.
- Moved Property Finish, histogram and core tonal controls into the Develop workspace; Colour, Detail, Geometry, Masks, Retouch and Export now have dedicated focused workspaces.
- Added contextual inspector headings and helper text, a clearer live-processing indicator and a compact persistent project filmstrip.
- Kept undo/redo, compare view, RAW development, zoom, keyboard shortcuts and Save Copy available.
- Preserved the existing photo renderer, edit recipe schema and saved photo records. No source photo bytes or business data migration is required.

## Scope and verification
- This release is a user-interface and workflow redesign; it does not claim the Phase 2 higher-precision RAW/image-processing engine or automatic room/window semantic selection.
- CI checks the workspace structure, direct tool wiring, document-preview regression and Photo Studio engine regression suite.
- Installed-app usability, visual layout and real Canon EOS 600D CR2 workflow should be confirmed on the target Windows PC.
