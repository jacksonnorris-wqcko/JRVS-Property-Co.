# JRVS Desktop — Managed Photo Library

## Current implementation (V0.50.0)

JRVS keeps the existing IndexedDB photo collection as the photo studio's active working cache and creates a second, native managed copy in the Tauri application data folder:

```text
<app-data>/workspace/
  jrvs.sqlite
  photos/
    originals/<photo-id>.<original-extension>
    previews/<photo-id>.jpg
    staging/
    trash/
  backups/
```

- The app obtains its application data path from Tauri at runtime. It does not hard-code a Windows username or drive letter.
- New and changed photo records are mirrored to the managed folder and indexed in SQLite.
- Original source files are written to staging first and then promoted to the managed path.
- Photo IDs are sanitized for filesystem use. The original filename and full metadata remain in SQLite.
- Deleting a photo moves the managed assets to the workspace trash folder; it does not immediately purge the only native copy.
- The migration exporter includes IndexedDB photo Blobs and previews in the portable legacy export. Import stores those blobs back into the photo UI cache and copies the originals into the managed folder.

## Important distinction

The current photo UI still reads and writes its IndexedDB working cache. Native managed copies provide a separate filesystem copy and make portable backups possible, but the app has not yet switched every photo viewer/editor to read directly from managed paths. A later stage will make the native managed library the primary source and add recovery/reconciliation tooling.

## RAW and offline support

The current RAW decoder is loaded dynamically from the existing external runtime. Fully offline RAW support, pinned decoder assets, and validation against the user's Canon EOS 600D CR2 samples remain outstanding. Do not claim full offline RAW editing until those tests pass.
