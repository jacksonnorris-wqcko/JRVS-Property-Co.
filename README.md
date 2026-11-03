# JRVS Property Co. — V0.0.5 Beta

## What's new: dedicated photo editing workspace
- Open a photo in a separate editing workspace from its project gallery.
- Adjust brightness, contrast, saturation, warmth, highlights and shadows.
- Rotate photos left or right.
- Apply centred crop ratios: original, 4:3, 3:2, 16:9 or square.
- Reset adjustments at any time.
- Save an edited copy as a new photo in the same project. The original is never overwritten.
- Edited copies are marked Edited and remain separate from original photos.

## Install / update
Upload the contents of this ZIP to the root of the existing GitHub Pages repository, replacing the previous files. Keep the same repository and browser profile. The app checks `version.json` for updates and the service worker cache is updated to V0.0.5.

## Storage
Jobs and clients remain in browser local storage; photos and edited copies remain in IndexedDB on that device/browser. This release does not add cloud sync. Do not clear browser site data if you want to keep local records and photographs. Keep independent backups of important originals.

## Notes
Crop uses a centred fixed aspect ratio; freeform crop positioning is not included yet. Editing is performed locally in the browser.
