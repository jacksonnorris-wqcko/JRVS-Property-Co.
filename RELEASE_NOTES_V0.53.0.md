# JRVS Property Co. Desktop — V0.53.0 Release Notes

## JRVS Property Finish
- Replaced Rental Auto Enhance with a guided, image-aware Property Finish workflow.
- Added Natural Listing, Bright Listing and Window-safe finishing approaches.
- Analyses image luminance and uses one soft room-light map to apply a capped, image-specific shadow lift.
- Applies a restrained highlight shoulder for strong direct light while avoiding automatic white-balance, saturation, clarity and sharpening changes.
- Corrections are tailored to each image instead of applying a one-size-fits-all preset.
- Shows a concise analysis report before saving.
- Originals remain untouched and edit settings are stored as non-destructive recipes.

## Smart Finish · Whole Property
- Added a property-level workflow that analyses each original separately.
- Uses the current edited photo as a brightness reference while allowing per-image highlight, shadow and colour corrections.
- Creates new edited copies; originals and existing edits remain untouched.
- One problem file does not prevent other photos from finishing.

## Tone pipeline corrections
- Fixed the rendering gate that prevented local light recovery and the natural tonal curve from operating together.
- Saved/restored the natural curve, local recovery state and Property Finish analysis in edit recipes.
- Reset clears advanced finishing stages and their analysis report.

## Dashboard and desktop UI
- Continued the V0.48 reference-design visual pass with stronger dashboard hierarchy, roomier KPI cards, a clearer jobs table and more legible quick actions.
- Recent Properties now expands a single real property across the available panel width; multiple properties flow into responsive columns.
- Added a structured Recent Properties first-run state with a direct New Job action.
- Main browser/PWA branch remains untouched.
