# JRVS Desktop — Managed Photo Library

## Current implementation (V0.50.0)

JRVS keeps the existing IndexedDB photo collection as the Photo Studio's active working cache and mirrors committed photo changes into a native managed copy in the Tauri application data folder:

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
- Committed `put` and `add` operations in `jrvs-photo-library/photos` are mirrored after their IndexedDB transaction completes.
- A new photo copies its original and optional preview into the managed folder and writes metadata to SQLite.
- Metadata-only changes update the SQLite metadata row without recopying a potentially large original file.
- Committed photo deletes move managed assets to the workspace trash folder; clearing the photo store quarantines all indexed managed assets.
- The photo mirror has a serial queue and exposes a flush operation so migration/backup workflows can wait for native writes to finish.
- Original source files are written to staging first and then promoted to their managed path.
- Photo IDs are sanitized for filesystem use. The original filename and full metadata remain in SQLite.
- Imports copy photo Blobs into IndexedDB, wait for the native mirror queue, and only then commit the business/calendar payload to SQLite.

## Important distinction

The photo UI still reads and writes its IndexedDB working cache. Native managed copies provide a separate filesystem copy and make portable backups possible, but the app has not yet switched every photo viewer/editor to read directly from managed paths. A later stage will make the native managed library the primary source and add recovery/reconciliation tooling.

## Backup integrity

Version 2 workspace exports include each original and preview byte length and SHA-256 hash. The importer verifies these values, along with business/calendar payload hashes and duplicate photo IDs, before replacing business data. Older version 1 exports remain importable without checksum validation.

## RAW and offline support

The current RAW decoder is loaded dynamically from the existing external runtime. Fully offline RAW support, pinned decoder assets, and validation against the user's Canon EOS 600D CR2 samples remain outstanding. Do not claim full offline RAW editing until those tests pass.
