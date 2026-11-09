# JRVS Property Co. — Release Notes V0.40.0

## Rental Auto Enhance: single-JPEG tonal refinement

- Raised the adaptive midtone target from 137 to 158 after V0.39 remained materially darker than the approved original-editor benchmark.
- Reduced automatic highlight suppression and moved the soft-shoulder transition higher to retain brightness in white cabinetry, benchtops and sunlit surfaces.
- Increased controlled local and scene-wide shadow/midtone recovery while retaining a deep-black guard and highlight protection.
- Kept the workflow based on the embedded JPEG preview extracted from CR2/compatible RAW files. This release does not yet decode or develop RAW sensor data.
- Preserved non-destructive editing, original-photo storage, existing app data structures and the existing user interface.

## Testing focus

Run the same CR2 through the app and compare its extracted-JPEG Auto Enhance result against the approved original-editor output. Check living-room visibility, kitchen highlight detail, neutral whites, timber colour and noise in lifted shadows.

## Release

Version: 0.40.0
